import { transporter } from "./mailer"

export interface OrderEmailData {
  userName:       string
  userEmail:      string
  invoiceNo:      string
  packageName:    string
  features:       string[]   // ← added
  deliveryDays:   number     // ← added
  amount:         number
  currency:       string
  currencySymbol: string
  subscriptionId:        string
  createdAt:      Date
}

// ─── User invoice email (with PDF attachment) ────────────────────────────────
export async function sendOrderInvoiceEmail(data: OrderEmailData, pdfBuffer: Buffer) {
  await transporter.sendMail({
    from:    `"PackShop" <${process.env.SMTP_USER}>`,
    to:      data.userEmail,
    subject: `Invoice ${data.invoiceNo} — ${data.packageName} Pack`,
    html:    buildInvoiceHtml(data),
    attachments: [
      {
        filename:    `${data.invoiceNo}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  })
}

// ─── Admin notification email ────────────────────────────────────────────────
export async function sendAdminNewOrderEmail(data: OrderEmailData, pdfBuffer: Buffer) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER!
  await transporter.sendMail({
    from:    `"PackShop" <${process.env.SMTP_USER}>`,
    to:      adminEmail,
    subject: `[New Subscription] ${data.invoiceNo} — ${data.packageName} (${data.currencySymbol}${data.amount})`,
    html: `
      <div style="font-family:sans-serif;padding:24px">
        <h2 style="color:#111">Subscribed</h2>
        <table style="border-collapse:collapse;width:100%;max-width:400px">
          <tr><td style="padding:6px;color:#666">Invoice</td>  <td style="padding:6px;font-weight:bold">${data.invoiceNo}</td></tr>
          <tr><td style="padding:6px;color:#666">Customer</td> <td style="padding:6px;font-weight:bold">${data.userName}</td></tr>
          <tr><td style="padding:6px;color:#666">Email</td>    <td style="padding:6px">${data.userEmail}</td></tr>
          <tr><td style="padding:6px;color:#666">Package</td>  <td style="padding:6px;font-weight:bold">${data.packageName}</td></tr>
          <tr><td style="padding:6px;color:#666">Amount</td>   <td style="padding:6px;font-weight:bold;color:#16a34a">${data.currencySymbol}${data.amount} ${data.currency}</td></tr>
        </table>
      </div>
    `,
    attachments: [
      {
        filename:    `${data.invoiceNo}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  })
}

// ─── HTML email body ─────────────────────────────────────────────────────────
function buildInvoiceHtml(data: OrderEmailData): string {
  const date = new Date(data.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })
  const featuresHtml = data.features
    .map(f => `<li style="margin-bottom:6px;font-size:13px;color:#333">${f}</li>`)
    .join("")

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${data.invoiceNo}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;color:#111">
<div style="max-width:600px;margin:0 auto;background:#fff">

  <!-- Header -->
  <div style="background:#111;padding:28px 40px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="color:#FFD000;font-size:22px;font-weight:900;letter-spacing:4px">★ PACKSHOP</div>
      <div style="color:#aaa;font-size:10px;margin-top:4px;letter-spacing:2px">OFFICIAL INVOICE</div>
    </div>
    <div style="background:#FFD000;padding:8px 16px">
      <span style="color:#111;font-weight:900;font-size:13px;letter-spacing:3px">✓ PAID</span>
    </div>
  </div>

  <!-- Body -->
  <div style="padding:32px 40px">

    <!-- Invoice details -->
    <div style="font-size:8px;font-weight:bold;color:#666;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Invoice Details</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
      <tr><td style="color:#666;font-size:11px;padding:4px 0">Invoice No.</td><td style="font-weight:bold;font-size:11px;text-align:right">${data.invoiceNo}</td></tr>
      <tr><td style="color:#666;font-size:11px;padding:4px 0">Date</td>       <td style="font-weight:bold;font-size:11px;text-align:right">${date}</td></tr>
      <tr><td style="color:#666;font-size:11px;padding:4px 0">Status</td>     <td style="font-weight:bold;font-size:11px;text-align:right;color:#16a34a">PAID</td></tr>
    </table>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>

    <!-- Customer -->
    <div style="font-size:8px;font-weight:bold;color:#666;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Billed To</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
      <tr><td style="color:#666;font-size:11px;padding:4px 0">Name</td> <td style="font-weight:bold;font-size:11px;text-align:right">${data.userName}</td></tr>
      <tr><td style="color:#666;font-size:11px;padding:4px 0">Email</td><td style="font-weight:bold;font-size:11px;text-align:right">${data.userEmail}</td></tr>
    </table>

    <hr style="border:none;border-top:2px solid #111;margin:24px 0"/>

    <!-- Package -->
    <div style="background:#F5F0E8;padding:20px 24px;margin:16px 0">
      <div style="font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-1px">${data.packageName}</div>
      <div style="font-size:9px;color:#666;margin-top:4px;letter-spacing:1px;text-transform:uppercase">
        ONE-TIME PURCHASE · DELIVERY IN ${data.deliveryDays} DAYS
      </div>
      <div style="font-size:8px;font-weight:bold;color:#666;letter-spacing:2px;text-transform:uppercase;margin:16px 0 8px">What's Included</div>
      <ul style="margin:0;padding-left:18px">${featuresHtml}</ul>
    </div>

    <!-- Total -->
    <div style="background:#111;padding:16px 24px;display:flex;justify-content:space-between;align-items:center;margin-top:16px">
      <span style="color:#fff;font-weight:900;font-size:12px;letter-spacing:2px">TOTAL PAID</span>
      <span style="color:#FFD000;font-weight:900;font-size:26px">${data.currencySymbol}${data.amount} <span style="font-size:12px">${data.currency}</span></span>
    </div>

    <p style="font-size:12px;color:#666;margin-top:24px;line-height:1.7">
      Thank you for your purchase. You are subscribed with your selected package</strong>.
    </p>
    <p style="font-size:10px;color:#aaa;margin-top:8px">Subscription ID: ${data.subscriptionId}</p>
    <p style="font-size:10px;color:#aaa;margin-top:4px">PDF invoice is attached to this email.</p>
  </div>

  <!-- Footer -->
  <div style="padding:16px 40px;border-top:1px solid #eee;display:flex;justify-content:space-between">
    <span style="font-size:10px;color:#999">© ${new Date().getFullYear()} PackShop. All rights reserved.</span>
    <span style="font-size:10px;color:#999">Do not reply to this email.</span>
  </div>

</div>
</body>
</html>`
}