import type { CardTypeValue } from "@/lib/card-types";

type CardEmailParams = {
  to: string;
  productName: string;
  codes: string[];
  cardType?: string | null;
  orderId: string;
  siteUrl: string;
};

function stackHintEn(cardType: string | null | undefined, count: number): string {
  if (count <= 1) {
    return "<p>Copy the code and activate it in the app.</p>";
  }
  if (cardType === "annual") {
    return `<p><strong>Important:</strong> You received <strong>${count} monthly codes</strong>. In the app, go to activation and redeem <strong>each code one by one</strong> (12 times total). Each code adds about 1 month — together they extend your access for about 12 months.</p>`;
  }
  if (cardType === "quarterly") {
    return `<p><strong>Important:</strong> You received <strong>${count} monthly codes</strong>. In the app, go to activation and redeem <strong>each code one by one</strong> (3 times total). Each code adds about 1 month — together they extend your access for about 3 months.</p>`;
  }
  return `<p>You received ${count} codes. Activate each code separately in the app to extend your access.</p>`;
}

function codesHtml(codes: string[]): string {
  if (codes.length === 1) {
    return `<p style="font-size:20px;font-weight:bold;letter-spacing:2px;background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">${codes[0]}</p>`;
  }
  return codes
    .map(
      (code, i) =>
        `<p style="margin:8px 0"><strong>#${i + 1}</strong> <span style="font-family:monospace;font-size:16px;font-weight:bold">${code}</span></p>`,
    )
    .join("");
}

/**
 * Send card code(s) to the buyer. Uses Resend if configured
 * (RESEND_API_KEY + EMAIL_FROM). If not configured, no-ops so the
 * order still completes (cards remain viewable on the site).
 */
export async function sendCardEmail(params: CardEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !params.to || params.codes.length === 0) return;

  const lookupUrl = `${params.siteUrl}/cards?orderId=${encodeURIComponent(params.orderId)}&email=${encodeURIComponent(params.to)}`;
  const count = params.codes.length;
  const cardType = params.cardType as CardTypeValue | null | undefined;

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#111">${params.productName}</h2>
      <p>Thank you for your purchase. Here ${count === 1 ? "is your card code" : "are your card codes"}:</p>
      ${codesHtml(params.codes)}
      ${stackHintEn(cardType, count)}
      <p><a href="${lookupUrl}">View your order online</a></p>
      <p style="color:#888;font-size:12px">Order ${params.orderId}</p>
    </div>
  `;

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject:
          count === 1
            ? `Your card code · ${params.productName}`
            : `Your ${count} card codes · ${params.productName}`,
        html,
      }),
    });
  } catch {
    // Delivery failure must not block fulfillment.
  }
}
