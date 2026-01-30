/**
 * Send email via SMTP2GO API.
 * Requires SMTP2GO_API_KEY and SMTP2GO_FROM_EMAIL in env.
 * https://developers.smtp2go.com/docs/send-an-email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.SMTP2GO_API_KEY;
  const from = process.env.SMTP2GO_FROM_EMAIL;

  if (!apiKey || !from) {
    return { ok: false, error: "SMTP2GO not configured" };
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
      return { ok: false, error: data?.error ?? res.statusText };
    }
    if (data?.data?.succeeded !== 1) {
      return { ok: false, error: data?.error ?? "Send failed" };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    return { ok: false, error: message };
  }
}
