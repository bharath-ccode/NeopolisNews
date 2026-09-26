import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { rateLimit } from "@/lib/rateLimit";
import { CONCIERGE_TOOLS, runConciergeTool } from "@/lib/concierge/tools";

export const maxDuration = 30;

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the Neopolis Concierge — a helpful assistant on NeopolisNews, a hyperlocal platform for the Neopolis urban district (Kokapet, Narsingi, Financial District, and nearby Hyderabad localities).

Residents ask you to find businesses, real-estate projects, and events on the platform. You have search tools for all three — use them whenever a question could be answered by looking something up, rather than guessing.

Rules:
- Only state facts (names, phone numbers, addresses, prices) that came from a tool result. Never invent or guess a business's details.
- If a search returns nothing, say so plainly and suggest broadening the search (a nearby locality, a different category) — don't pretend something exists.
- When you have results, name the actual options and include their link so the resident can open the page themselves.
- You can only find and point to things — you can't book appointments, claim event slots, or submit forms on the resident's behalf. If asked to do one of those, say so and point them to the right page instead.
- Keep replies short and conversational — a few sentences, not an essay. This is a chat, not a report.
- If the request is outside Neopolis/this platform's scope entirely (unrelated general knowledge), say this concierge is scoped to the Neopolis platform.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "concierge-chat", { limit: 20, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const messages: ChatMessage[] = Array.isArray(body?.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // Bound context growth — keep only the most recent turns.
  const recent = messages.slice(-12);
  const conversation: Anthropic.MessageParam[] = recent.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    // Manual tool-use loop, capped so a misbehaving round can't run away.
    for (let round = 0; round < 4; round++) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: CONCIERGE_TOOLS,
        messages: conversation,
      });

      if (response.stop_reason !== "tool_use") {
        const text = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        return NextResponse.json({ reply: text || "I couldn't find anything on that — try rephrasing?" });
      }

      conversation.push({ role: "assistant", content: response.content });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );
      const toolResults = await Promise.all(
        toolUseBlocks.map(async (block) => ({
          type: "tool_result" as const,
          tool_use_id: block.id,
          content: await runConciergeTool(block.name, block.input as Record<string, unknown>),
        }))
      );
      conversation.push({ role: "user", content: toolResults });
    }

    return NextResponse.json({ reply: "That took more digging than expected — could you narrow your question a bit?" });
  } catch (err) {
    console.error("concierge chat:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
