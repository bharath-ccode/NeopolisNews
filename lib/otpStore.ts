// ─── Server-side in-memory OTP store ────────────────────────────────────────
// Lives in the Node.js process; persists across requests within one process.

interface OtpEntry {
  otp: string;
  expiresAt: number; // Unix ms
}

const store = new Map<string, OtpEntry>();

const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function setOtp(businessId: string, otp: string): void {
  store.set(businessId, { otp, expiresAt: Date.now() + TTL_MS });
}

/** Returns true and deletes the entry on success; false on wrong/expired OTP. */
export function verifyOtp(businessId: string, candidate: string): boolean {
  const entry = store.get(businessId);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) {
    store.delete(businessId);
    return false;
  }
  if (entry.otp !== candidate) return false;
  store.delete(businessId); // single-use
  return true;
}
