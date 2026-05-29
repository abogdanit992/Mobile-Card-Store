type CardEmailParams = {
  to: string;
  productName: string;
  code: string;
  orderId: string;
  siteUrl: string;
};

/**
 * Send the card code to the buyer. Uses Resend if configured
 * (RESEND_API_KEY + EMAIL_FROM). If not configured, no-ops so the
 * order still completes (card remains viewable on the site).
 */
export async function sendCardEmail(params: CardEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from || !params.to) return;

  const lookupUrl = `${params.siteUrl}/cards?orderId=${params.orderId}`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#111">${params.productName}</h2>
      <p>Thank you for your purchase. Here is your card code:</p>
      <p style="font-size:20px;font-weight:bold;letter-spacing:2px;
                background:#f5f5f5;padding:16px;border-radius:8px;text-align:center">
        ${params.code}
      </p>
      <p>Copy the code and activate it in the app.</p>
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
        subject: `Your card code · ${params.productName}`,
        html,
      }),
    });
  } catch {
    // Delivery failure must not block fulfillment.
  }
}
