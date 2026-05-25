import { transporter } from "./mailer"

export interface OrderEmailData {
  userName:             string
  userEmail:            string
  invoiceNo:            string
  packageName:          string
  features:             string[]
  deliveryDays:         number
  amount:               number
  currency:             string
  currencySymbol:       string
  subscriptionId:       string
  createdAt:            Date
  logoCount?:           number
  bannerCount?:         number
  // Set only when a new account was auto-created for a guest
  newUserCredentials?:  { email: string; password: string }
}

export interface EmailAttachment {
  content:     string   // base64
  filename:    string
  type:        string
  disposition: "attachment"
}

// ─── User invoice email ───────────────────────────────────────────────────────
export async function sendOrderInvoiceEmail(
  data:        OrderEmailData,
  pdfBuffer:   Buffer,
  imageAttachments: EmailAttachment[] = [],
) {
  const logoFiles   = imageAttachments.filter((a) => a.filename.startsWith("logo"))
  const bannerFiles = imageAttachments.filter((a) => a.filename.startsWith("banner"))

  await transporter.sendMail({
    from:    `"Brief Lab Studio" <${process.env.SMTP_FROM_EMAIL}>`,
    to:      data.userEmail,
    subject: `Your designs are ready — Invoice ${data.invoiceNo}`,
    html:    buildUserHtml(data, logoFiles.length, bannerFiles.length),
    attachments: [
      {
        filename:    `${data.invoiceNo}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      },
      ...imageAttachments.map((img) => ({
        filename:    img.filename,
        content:     Buffer.from(img.content, "base64"),
        contentType: img.type,
      })),
    ],
  })
}

// ─── Admin notification email ─────────────────────────────────────────────────
export async function sendAdminNewOrderEmail(
  data:        OrderEmailData,
  pdfBuffer:   Buffer,
  imageAttachments: EmailAttachment[] = [],
) {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER!

  await transporter.sendMail({
    from:    `"Brief Lab Studio" <${process.env.SMTP_FROM_EMAIL}>`,
    to:      adminEmail,
    subject: `[New Order] ${data.invoiceNo} — ${data.packageName} (${data.currencySymbol}${data.amount})`,
    html: `
      <div style="font-family:sans-serif;padding:24px;max-width:500px">
        <h2 style="color:#111;margin-bottom:16px">New Order Received</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Invoice</td>
              <td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">${data.invoiceNo}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Customer</td>
              <td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">${data.userName}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Email</td>
              <td style="padding:8px;border-bottom:1px solid #eee">${data.userEmail}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Package</td>
              <td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee">${data.packageName}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Amount</td>
              <td style="padding:8px;font-weight:bold;color:#16a34a;border-bottom:1px solid #eee">${data.currencySymbol}${data.amount} ${data.currency}</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Logos</td>
              <td style="padding:8px;border-bottom:1px solid #eee">${data.logoCount ?? 0} generated</td></tr>
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Banners</td>
              <td style="padding:8px;border-bottom:1px solid #eee">${data.bannerCount ?? 0} generated</td></tr>
          ${data.newUserCredentials ? `
          <tr><td style="padding:8px;color:#666;border-bottom:1px solid #eee">Account</td>
              <td style="padding:8px;color:#b45309;border-bottom:1px solid #eee">New account auto-created</td></tr>
          ` : ""}
        </table>
        <p style="font-size:12px;color:#999;margin-top:16px">
          All generated files and PDF invoice are attached below.
        </p>
      </div>
    `,
    attachments: [
      {
        filename:    `${data.invoiceNo}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf",
      },
      ...imageAttachments.map((img) => ({
        filename:    img.filename,
        content:     Buffer.from(img.content, "base64"),
        contentType: img.type,
      })),
    ],
  })
}

// ─── User HTML email body ─────────────────────────────────────────────────────
function buildUserHtml(
  data:        OrderEmailData,
  logoCount:   number,
  bannerCount: number,
): string {
  const date = new Date(data.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })

  const featuresHtml = data.features
    .map((f) => `<li style="margin-bottom:6px;font-size:13px;color:#333">${f}</li>`)
    .join("")

  const attachmentSummary = [
    logoCount   > 0 ? `${logoCount} Logo${logoCount > 1 ? "s" : ""}`      : "",
    bannerCount > 0 ? `${bannerCount} Banner${bannerCount > 1 ? "s" : ""}` : "",
  ].filter(Boolean).join(" &amp; ")

  // ── Credentials block (only for newly auto-created accounts) ──────────────
  const credentialsBlock = data.newUserCredentials ? `
    <div style="margin-top:24px;padding:20px 24px;background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b">
      <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;color:#92400e;margin-bottom:10px">
        Your Account Has Been Created
      </div>
      <p style="font-size:12px;color:#78350f;margin:0 0 12px;line-height:1.6">
        We created a Brief Lab Studio account for you so you can track your order.
        Use the credentials below to log in anytime.
      </p>
      <table style="border-collapse:collapse;width:100%">
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#92400e;width:80px">Email</td>
          <td style="padding:6px 0;font-size:12px;font-weight:bold;color:#111;font-family:monospace">
            ${data.newUserCredentials.email}
          </td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;color:#92400e">Password</td>
          <td style="padding:6px 0;font-size:12px;font-weight:bold;color:#111;font-family:monospace">
            ${data.newUserCredentials.password}
          </td>
        </tr>
      </table>
      <p style="font-size:11px;color:#b45309;margin:12px 0 0">
        For your security, please change your password after logging in.
      </p>
    </div>
  ` : ""

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Your designs are ready — ${data.invoiceNo}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:Georgia,serif;color:#111">
<div style="max-width:600px;margin:0 auto;background:#fff">

  <!-- Header -->
  <div style="background:#111;padding:28px 40px">
    <div style="color:#FFD000;font-size:22px;font-weight:900;letter-spacing:4px">★ Brief Lab Studio</div>
    <div style="color:#aaa;font-size:10px;margin-top:4px;letter-spacing:2px;text-transform:uppercase">Official Invoice &amp; Design Delivery</div>
  </div>

  <!-- Hero message -->
  <div style="background:#FFD000;padding:24px 40px">
    <div style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;color:#111">
      Your designs are ready!
    </div>
    <div style="font-size:13px;color:#333;margin-top:6px">
      ${attachmentSummary} ${logoCount + bannerCount > 1 ? "are" : "is"} attached to this email.
    </div>
  </div>

  <!-- Body -->
  <div style="padding:32px 40px">

    <!-- Invoice details -->
    <div style="font-size:8px;font-weight:bold;color:#666;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Invoice Details</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
      <tr>
        <td style="color:#666;font-size:11px;padding:4px 0">Invoice No.</td>
        <td style="font-weight:bold;font-size:11px;text-align:right">${data.invoiceNo}</td>
      </tr>
      <tr>
        <td style="color:#666;font-size:11px;padding:4px 0">Date</td>
        <td style="font-weight:bold;font-size:11px;text-align:right">${date}</td>
      </tr>
      <tr>
        <td style="color:#666;font-size:11px;padding:4px 0">Status</td>
        <td style="font-weight:bold;font-size:11px;text-align:right;color:#16a34a">PAID</td>
      </tr>
    </table>

    <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>

    <!-- Customer -->
    <div style="font-size:8px;font-weight:bold;color:#666;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px">Billed To</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:4px">
      <tr>
        <td style="color:#666;font-size:11px;padding:4px 0">Name</td>
        <td style="font-weight:bold;font-size:11px;text-align:right">${data.userName}</td>
      </tr>
      <tr>
        <td style="color:#666;font-size:11px;padding:4px 0">Email</td>
        <td style="font-weight:bold;font-size:11px;text-align:right">${data.userEmail}</td>
      </tr>
    </table>

    <hr style="border:none;border-top:2px solid #111;margin:24px 0"/>

    <!-- Package -->
    <div style="background:#F5F0E8;padding:20px 24px;margin:16px 0">
      <div style="font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-1px">${data.packageName}</div>
      <div style="font-size:9px;color:#666;margin-top:4px;letter-spacing:1px;text-transform:uppercase">
        ONE-TIME PURCHASE &nbsp;·&nbsp; AI-GENERATED &nbsp;·&nbsp; DELIVERED INSTANTLY
      </div>

      <!-- Files summary -->
      <div style="display:flex;gap:12px;margin-top:16px">
        ${logoCount > 0 ? `
        <div style="background:#111;padding:10px 16px;text-align:center">
          <div style="color:#FFD000;font-size:22px;font-weight:900">${logoCount}</div>
          <div style="color:#aaa;font-size:9px;letter-spacing:1px;text-transform:uppercase">Logo${logoCount > 1 ? "s" : ""}</div>
        </div>` : ""}
        ${bannerCount > 0 ? `
        <div style="background:#FFD000;padding:10px 16px;text-align:center">
          <div style="color:#111;font-size:22px;font-weight:900">${bannerCount}</div>
          <div style="color:#333;font-size:9px;letter-spacing:1px;text-transform:uppercase">Banner${bannerCount > 1 ? "s" : ""}</div>
        </div>` : ""}
      </div>

      <div style="font-size:8px;font-weight:bold;color:#666;letter-spacing:2px;text-transform:uppercase;margin:16px 0 8px">
        What's Included
      </div>
      <ul style="margin:0;padding-left:18px">${featuresHtml}</ul>
    </div>

    <!-- Total -->
    <div style="background:#111;padding:16px 24px;margin-top:16px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="color:#fff;font-weight:900;font-size:12px;letter-spacing:2px;text-transform:uppercase">
            TOTAL PAID
          </td>
          <td style="text-align:right">
            <span style="color:#FFD000;font-weight:900;font-size:26px">
              ${data.currencySymbol}${data.amount}
            </span>
            <span style="color:#aaa;font-size:12px;margin-left:4px">${data.currency}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Account credentials (only for new auto-created accounts) -->
    ${credentialsBlock}

    <!-- Instructions -->
    <div style="margin-top:24px;padding:16px;border-left:3px solid #FFD000;background:#fffdf0">
      <div style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">
        How to access your files
      </div>
      <p style="font-size:12px;color:#555;margin:0;line-height:1.7">
        All your generated designs are attached to this email as PNG files.
        Logo files are named <strong>logo-1.png</strong>, <strong>logo-2.png</strong> etc.
        Banner files are named <strong>banner-1.png</strong>, <strong>banner-2.png</strong> etc.
        Your PDF invoice is also attached separately.
      </p>
    </div>

    <p style="font-size:10px;color:#aaa;margin-top:24px">Subscription ID: ${data.subscriptionId}</p>
  </div>

  <!-- Footer -->
  <div style="padding:16px 40px;border-top:1px solid #eee">
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="font-size:10px;color:#999">© ${new Date().getFullYear()} Brief Lab Studio. All rights reserved.</td>
        <td style="font-size:10px;color:#999;text-align:right">Do not reply to this email.</td>
      </tr>
    </table>
  </div>

</div>
</body>
</html>`
}