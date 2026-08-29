export interface DialogueTurn {
  speaker: string;
  line: string;
}

// "Name: line" repeated at least twice with two distinct names — anything
// looser (a single "Note:" prefix, say) is treated as a plain statement.
const SPEAKER_LABEL = /(?:^|\n)\s*([A-Z][A-Za-z0-9' .-]{0,24}):\s*/g;

/** Detects a back-and-forth "Speaker: line" caption and splits it into
 *  turns; returns null when the text reads as one plain statement instead
 *  (the common case for a single-panel gag caption). */
export function parseCartoonDialogue(text: string): DialogueTurn[] | null {
  const matches = [...text.matchAll(SPEAKER_LABEL)];
  if (matches.length < 2) return null;

  const speakers = new Set(matches.map((m) => m[1].trim().toLowerCase()));
  if (speakers.size < 2) return null;

  const turns: DialogueTurn[] = matches.map((m, i) => {
    const start = (m.index ?? 0) + m[0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    return {
      speaker: m[1].trim(),
      line: text.slice(start, end).trim().replace(/^["“]+|["”]+$/g, ""),
    };
  });

  return turns.every((t) => t.line) ? turns : null;
}
