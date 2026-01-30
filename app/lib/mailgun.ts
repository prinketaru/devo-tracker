/**
 * Send email via Mailgun API.
 * Requires MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM_EMAIL in env.
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM_EMAIL;

  if (!apiKey || !domain || !from) {
    return { ok: false, error: "Mailgun not configured" };
  }

  const host = process.env.MAILGUN_HOST ?? "api.mailgun.net";
  const url = `https://${host}/v3/${domain}/messages`;

  const form = new URLSearchParams();
  form.set("from", from);
  form.set("to", options.to);
  form.set("subject", options.subject);
  form.set("text", options.text);
  if (options.html) form.set("html", options.html);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err || res.statusText };
    }
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Send failed";
    return { ok: false, error: message };
  }
}
