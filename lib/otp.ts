import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const COOKIE_NAME = "otp_pending";

function sign(data: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET env var is not set.");
  return createHmac("sha256", secret).update(data).digest("hex");
}

/** Generate a 6-digit OTP and a signed cookie token for the given businessId. */
export function generateOtp(businessId: string): { otp: string; token: string } {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = Date.now() + OTP_TTL_MS;
  const payload = `${businessId}|${otp}|${expiresAt}`;
  const token = `${payload}|${sign(payload)}`;
  return { otp, token };
}

/** Attach the otp_pending httpOnly cookie to an existing NextResponse. */
export function setOtpCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 600,
    path: "/",
  });
}

/** Clear the otp_pending cookie (call after successful verification). */
export function clearOtpCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

export type OtpVerifyResult =
  | { ok: true }
  | { ok: false; error: string; status: number };

/**
 * Validate the otp_pending cookie against the submitted businessId + otp.
 * Returns { ok: true } on success or { ok: false, error, status } on failure.
 */
export function verifyOtpCookie(
  req: NextRequest,
  businessId: string,
  otp: string
): OtpVerifyResult {
  const cookie = req.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    return { ok: false, error: "Session expired. Please request a new verification code.", status: 400 };
  }

  const parts = cookie.split("|");
  if (parts.length !== 4) {
    return { ok: false, error: "Invalid session. Please request a new code.", status: 400 };
  }

  const [cookieBusinessId, cookieOtp, expiresAtStr, storedHmac] = parts;
  const payload = `${cookieBusinessId}|${cookieOtp}|${expiresAtStr}`;

  if (sign(payload) !== storedHmac) {
    return { ok: false, error: "Invalid session. Please request a new code.", status: 400 };
  }
  if (cookieBusinessId !== businessId) {
    return { ok: false, error: "Session mismatch. Please request a new code.", status: 400 };
  }
  if (Date.now() > Number(expiresAtStr)) {
    return { ok: false, error: "Code has expired. Please request a new verification code.", status: 400 };
  }
  if (cookieOtp !== String(otp)) {
    return { ok: false, error: "Incorrect code. Please try again.", status: 400 };
  }

  return { ok: true };
}

/** Shared OTP email HTML. headline and bodyLine are per-flow customisations. */
export function otpEmailHtml(opts: {
  headline: string;
  bodyLine: string;
  otp: string;
}): string {
  const { headline, bodyLine, otp } = opts;
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f9fafb;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:40px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;letter-spacing:0.05em;text-transform:uppercase;font-weight:600;">Neopolis News</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;color:#111827;">${headline}</h1>
          <p style="margin:0 0 20px;font-size:14px;color:#374151;">${bodyLine}</p>
          <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:10px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-size:36px;font-weight:900;letter-spacing:0.25em;color:#4338ca;font-family:monospace;">${otp}</span>
          </div>
          <p style="margin:0;font-size:13px;color:#6b7280;">Expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
