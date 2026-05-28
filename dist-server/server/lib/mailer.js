import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
function formatPKR(amount) {
    return `Rs. ${Math.round(amount).toLocaleString("en-PK")}`;
}
export async function sendOrderConfirmation(data) {
    const itemsHtml = data.items
        .map((item) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
          <strong>${item.productName}</strong><br/>
          <span style="color:#888;font-size:13px;">${item.color} / Size ${item.size} × ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">
          ${formatPKR(item.price * item.quantity)}
        </td>
      </tr>`)
        .join("");
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#111;padding:32px 40px;">
      <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">ADNAN SHOES</h1>
      <p style="margin:6px 0 0;color:#aaa;font-size:13px;">Order Confirmed</p>
    </div>
    <div style="padding:36px 40px;">
      <h2 style="margin:0 0 8px;color:#111;">Shukriya, ${data.toName}!</h2>
      <p style="color:#555;margin:0 0 24px;">Order #${data.orderId} confirm ho gaya hai.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        <thead><tr>
          <th style="text-align:left;padding-bottom:12px;color:#888;font-size:11px;text-transform:uppercase;border-bottom:2px solid #eee;">Product</th>
          <th style="text-align:right;padding-bottom:12px;color:#888;font-size:11px;text-transform:uppercase;border-bottom:2px solid #eee;">Price</th>
        </tr></thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
        <tr><td style="padding:6px 0;color:#555;">Subtotal</td><td style="text-align:right;color:#555;">${formatPKR(data.subtotal)}</td></tr>
        <tr><td style="padding:6px 0;color:#555;">Shipping</td><td style="text-align:right;color:#555;">${data.shippingCost === 0 ? "Free" : formatPKR(data.shippingCost)}</td></tr>
        <tr style="border-top:2px solid #111;">
          <td style="padding:12px 0 0;font-weight:700;font-size:16px;color:#111;">Total</td>
          <td style="padding:12px 0 0;text-align:right;font-weight:700;font-size:16px;color:#111;">${formatPKR(data.total)}</td>
        </tr>
      </table>
      <div style="margin-top:32px;padding:20px;background:#f9f9f9;">
        <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;color:#888;font-weight:600;">Delivery Address</p>
        <p style="margin:0;color:#333;line-height:1.7;">
          ${data.shippingAddress.fullName}<br/>
          ${data.shippingAddress.line1}${data.shippingAddress.line2 ? ", " + data.shippingAddress.line2 : ""}<br/>
          ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}<br/>
          ${data.shippingAddress.country}
        </p>
      </div>
    </div>
    <div style="background:#f4f4f4;padding:24px 40px;text-align:center;">
      <p style="margin:0;color:#999;font-size:12px;">Adnan Shoes · Premium Pakistani Footwear</p>
    </div>
  </div>
</body></html>`;
    await transporter.sendMail({
        from: `"Adnan Shoes" <${process.env.SMTP_USER}>`,
        to: data.toEmail,
        subject: `Order Confirmed #${data.orderId} — Adnan Shoes`,
        html,
    });
}
