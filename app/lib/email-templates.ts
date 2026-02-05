/**
 * Email templates styled to match the DayMark site.
 * Colors: background #fbf7ef, text #1f1a12, muted #78716c, accent #b45309.
 */

const STYLES = {
  bg: "#fbf7ef",
  text: "#1f1a12",
  muted: "#78716c",
  accent: "#b45309",
  accentHover: "#92400e",
  border: "#e7e5e4",
  fontSans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontSerif: "Georgia, 'Times New Roman', serif",
} as const;

function getBaseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://devo-tracker.vercel.app";
}

function getUnsubscribeFooter(): { html: string; text: string } {
  const settingsUrl = `${getBaseUrl()}/settings`;
  return {
    html: `— DayMark<br><br><span style="font-size:12px;">You're receiving this because you have email notifications enabled. To manage your preferences or unsubscribe, <a href="${settingsUrl}" style="color:${STYLES.accent}; text-decoration:underline;">go to Settings</a>.</span>`,
    text: `— DayMark\n\nYou're receiving this because you have email notifications enabled. To manage your preferences or unsubscribe, go to Settings: ${settingsUrl}`,
  };
}

function emailWrapper(content: string): string {
  const footer = getUnsubscribeFooter();
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DayMark</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family:${STYLES.fontSans}; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background:${STYLES.bg}; border-radius:12px; border:1px solid ${STYLES.border}; overflow:hidden;">
          <tr>
            <td style="padding:24px 24px 20px; border-bottom:1px solid ${STYLES.border};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <div style="width:36px; height:36px; border-radius:8px; background:${STYLES.accent}; color:#fff; font-size:18px; font-weight:600; font-family:${STYLES.fontSans}; line-height:36px; text-align:center;">D</div>
                  </td>
                  <td style="vertical-align:middle; padding-left:12px;">
                    <div style="font-size:16px; font-weight:600; color:${STYLES.accent};">DayMark</div>
                    <div style="font-size:12px; color:${STYLES.muted};">Daily devotion, made consistent.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px; color:${STYLES.text}; font-size:15px; line-height:1.6;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px 24px; border-top:1px solid ${STYLES.border}; font-size:13px; color:${STYLES.muted};">
              ${footer.html}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const OTP_SIGNIN_SUBJECT = "DayMark – Your sign-in code";

export function getOtpEmail(otp: string, type: "sign-in" | "email-verification" | "forget-password"): { subject: string; text: string; html: string } {
  const content =
    type === "sign-in"
      ? `Sign in to DayMark`
      : type === "email-verification"
        ? `Verify your email address`
        : `Reset your password`;
  const text = `Your verification code is: ${otp}\n\nThis code expires in 10 minutes. If you didn't request this, you can safely ignore this email.`;
  const contentHtml = `
    <h2 style="margin:0 0 12px; font-size:22px; font-weight:600; font-family:${STYLES.fontSerif}; color:${STYLES.text};">
      ${content}
    </h2>
    <p style="margin:0 0 20px; color:${STYLES.text}; line-height:1.65;">
      Your verification code is:
    </p>
    <p style="margin:0 0 20px; font-size:28px; font-weight:700; letter-spacing:0.2em; color:${STYLES.accent}; font-family:${STYLES.fontSans};">
      ${otp}
    </p>
    <p style="margin:0; font-size:13px; color:${STYLES.muted};">
      This code expires in 10 minutes. If you didn&apos;t request this, you can safely ignore this email.
    </p>
  `;
  return {
    subject: OTP_SIGNIN_SUBJECT,
    text,
    html: emailWrapper(contentHtml.trim()),
  };
}

export const GRACE_PERIOD_SUBJECT = "DayMark – You missed a day";

export function getGracePeriodEmail(graceStreakDays: number): { subject: string; text: string; html: string } {
  const baseUrl = getBaseUrl();
  const startUrl = `${baseUrl}/devotions/new`;

  const footerText = getUnsubscribeFooter().text;
  const text = `You missed a day — do a devotion to keep your ${graceStreakDays}-day streak! ✨

Your streak is at risk. Log a devotion today to keep it going.

Start your devotion: ${startUrl}

${footerText}`;

  const content = `
    <h2 style="margin:0 0 12px; font-size:22px; font-weight:600; font-family:${STYLES.fontSerif}; color:${STYLES.text};">
      You missed a day — keep your streak! ✨
    </h2>
    <p style="margin:0 0 20px; color:${STYLES.text}; line-height:1.65;">
      Your ${graceStreakDays}-day streak is at risk. Log a devotion today to keep it going.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${startUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:14px 24px; background:${STYLES.accent}; color:#fff !important; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
            Start your devotion
          </a>
        </td>
      </tr>
    </table>
  `;
  return {
    subject: GRACE_PERIOD_SUBJECT,
    text,
    html: emailWrapper(content.trim()),
  };
}

export const REMINDER_SUBJECT = "DayMark – Time for your devotion";

export function getReminderEmail(): { subject: string; text: string; html: string } {
  const baseUrl = getBaseUrl();
  const startUrl = `${baseUrl}/devotions/new`;

  const footerText = getUnsubscribeFooter().text;
  const text = `Time for your devotion ✨

A gentle nudge: this is your moment to pause and connect. Whether it's a few verses, a quiet prayer, or writing down what's on your heart—every small step counts.

Start your devotion: ${startUrl}

${footerText}`;

  const content = `
    <h2 style="margin:0 0 12px; font-size:22px; font-weight:600; font-family:${STYLES.fontSerif}; color:${STYLES.text};">
      Time for your devotion ✨
    </h2>
    <p style="margin:0 0 20px; color:${STYLES.text}; line-height:1.65;">
      A gentle nudge: this is your moment to pause and connect. Whether it's a few verses, a quiet prayer, or writing down what's on your heart—every small step counts.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr>
        <td>
          <a href="${startUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:14px 24px; background:${STYLES.accent}; color:#fff !important; font-size:15px; font-weight:600; text-decoration:none; border-radius:8px;">
            Start your devotion
          </a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: REMINDER_SUBJECT,
    text,
    html: emailWrapper(content.trim()),
  };
}

/** Returns a short message based on how many days they did devotions this week. */
function getWeeklyMessageByCount(daysCount: number): string {
  if (daysCount === 0) {
    return "No devotions recorded this week—and that's okay. Tomorrow is a fresh chance to begin again. Even one moment with Scripture or prayer can change the rhythm of your day.";
  }
  if (daysCount <= 2) {
    return "You showed up this week. That matters. Small, consistent steps build a habit that lasts.";
  }
  if (daysCount <= 4) {
    return "You're building a real rhythm. Keep going—you're more than halfway there.";
  }
  if (daysCount <= 6) {
    return "You're so close to a full week. Your consistency is inspiring.";
  }
  return "You did it—a full week of devotions! Thank you for making space for what matters. Here's to another week.";
}

export const WEEKLY_DIGEST_SUBJECT = "DayMark – Your weekly summary";

export function getWeeklyDigestEmail(
  name: string,
  daysCount: number,
  totalEntries: number,
  options?: { isPreview?: boolean }
): { subject: string; text: string; html: string } {
  const message = getWeeklyMessageByCount(daysCount);

  const previewNote = options?.isPreview
    ? "\n\n(This is a preview with sample numbers. Your real digest will show your actual stats.)\n\n"
    : "";

  const footerText = getUnsubscribeFooter().text;
  const text = `Hi ${name},

Your DayMark weekly summary:

• Days with devotions this week: ${daysCount} / 7
• Total devotion entries: ${totalEntries}
${previewNote}${message}

${footerText}`;

  const previewHtml = options?.isPreview
    ? `<p style="margin:0 0 16px; font-size:13px; color:${STYLES.muted}; font-style:italic;">
      This is a preview with sample numbers. Your real digest will show your actual stats.
    </p>`
    : "";

  const content = `
    <h2 style="margin:0 0 16px; font-size:22px; font-weight:600; font-family:${STYLES.fontSerif}; color:${STYLES.text};">
      Your weekly summary
    </h2>
    <p style="margin:0 0 20px; color:${STYLES.text};">
      Hi ${name},
    </p>
    <p style="margin:0 0 12px; color:${STYLES.text}; font-weight:600;">
      This week you had devotions on <strong>${daysCount} of 7</strong> days and wrote <strong>${totalEntries}</strong> ${totalEntries === 1 ? "entry" : "entries"}.
    </p>
    ${previewHtml}
    <p style="margin:0 0 24px; color:${STYLES.text}; line-height:1.65;">
      ${message}
    </p>
    <p style="margin:0; color:${STYLES.text};">
      Keep going! 🙏
    </p>
  `;

  return {
    subject: WEEKLY_DIGEST_SUBJECT,
    text,
    html: emailWrapper(content.trim()),
  };
}
