import { checkEmailLimit, recordEmailSent } from "./rate-limits";

/**
 * Send email via SMTP2GO API.
 * Enforces rate limits: 100/day, 2000/month (SMTP2GO free tier).
 * Requires SMTP2GO_API_KEY and SMTP2GO_FROM_EMAIL in env.
 * https://developers.smtp2go.com/docs/send-an-email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Skip rate limit check (e.g. for internal/admin use). Default false. */
  skipLimitCheck?: boolean;
}): Promise<{ ok: boolean; error?: string; rateLimited?: boolean }> {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const from = process.env.SMTP2GO_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, error: "SMTP2GO not configured" };
  }

  if (!options.skipLimitCheck) {
    const limit = await checkEmailLimit();
    if (!limit.allowed) {
      return { ok: false, error: limit.reason, rateLimited: true };
    }
  }

  const url = "https://api.smtp2go.com/v3/email/send";

  const body = {
    sender: from,
    to: [options.to],
    subject: options.subject,
    text_body: options.text,
    ...(options.html && { html_body: options.html }),
  };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Smtp2go-Api-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as { data?: { succeeded?: number }; error?: string };
    if (!res.ok) {
      if (res.status === 429) {
        return { ok: false, error: "SMTP2GO rate limit reached. Try again later.", rateLimited: true };
      }
      return { ok: false, error: data?.error ?? res.statusText };
    }
    if (data?.data?.succeeded !== 1) {
      return { ok: false, error: data?.error ?? "Send failed" };
    }
    await recordEmailSent();
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    return { ok: false, error: message };
  }
}
