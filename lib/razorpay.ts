import { createHmac } from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayOrderResult {
  ok: true;
  order: RazorpayOrder;
  keyId: string;
}

export interface RazorpayError {
  ok: false;
  error: string;
  status: number;
}

/** Create a Razorpay order. amount is in rupees (converted to paise internally). */
export async function createOrder(
  amountInr: number,
  receipt: string
): Promise<RazorpayOrderResult | RazorpayError> {
  if (!KEY_ID || !KEY_SECRET)
    return { ok: false, error: "Payment not configured.", status: 503 };

  const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({ amount: amountInr * 100, currency: "INR", receipt }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return {
      ok: false,
      error: body?.error?.description ?? "Failed to create payment order.",
      status: 502,
    };
  }

  const order: RazorpayOrder = await res.json();
  return { ok: true, order, keyId: KEY_ID };
}

/** Verify the Razorpay payment signature returned by the checkout widget. */
export function verifySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const expected = createHmac("sha256", KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return expected === razorpaySignature;
}
