import React from "react"
import { Document, Page, View, Text, StyleSheet, pdf, renderToBuffer } from "@react-pdf/renderer"

export interface InvoicePDFData {
  userName:       string
  userEmail:      string
  invoiceNo:      string
  packageName:    string
  tagline:        string
  features:       string[]
  deliveryDays:   number
  amount:         number
  currency:       string
  currencySymbol: string
  subscriptionId:        string
  createdAt:      Date
}

const C = {
  black:     "#111111",
  yellow:    "#FFD000",
  gray:      "#666666",
  lightGray: "#F5F0E8",
  white:     "#FFFFFF",
  green:     "#16a34a",
}

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: C.white },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    backgroundColor: C.black,
    padding: "28 40",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: C.yellow, fontSize: 20, fontFamily: "Helvetica-Bold", letterSpacing: 4 },
  headerSub:   { color: "#aaaaaa", fontSize: 8,  marginTop: 4, letterSpacing: 2 },
  paidBadge:   { backgroundColor: C.yellow, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 2 },
  paidText:    { color: C.black, fontSize: 12, fontFamily: "Helvetica-Bold", letterSpacing: 3 },

  // ── Body ────────────────────────────────────────────────────────────────
  body:  { padding: "28 40" },
  label: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray, letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 },
  row:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  key:   { fontSize: 10, color: C.gray,  letterSpacing: 1 },
  val:   { fontSize: 10, color: C.black, fontFamily: "Helvetica-Bold" },

  divider:      { borderBottomWidth: 1, borderBottomColor: "#EEEEEE", marginVertical: 18 },
  thickDivider: { borderBottomWidth: 2, borderBottomColor: C.black,   marginVertical: 20 },

  // ── Package box ─────────────────────────────────────────────────────────
  packBox:     { backgroundColor: C.lightGray, padding: "20 24", marginVertical: 14 },
  packName:    { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.black, textTransform: "uppercase" },
  packSub:     { fontSize: 9,  color: C.gray, marginTop: 4, letterSpacing: 1, textTransform: "uppercase" },
  featLabel:   { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray, letterSpacing: 2,
                 textTransform: "uppercase", marginBottom: 8, marginTop: 14 },
  featureRow:  { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  dot:         { width: 5, height: 5, backgroundColor: C.yellow, borderRadius: 3, marginRight: 8 },
  featureText: { fontSize: 10, color: C.black },

  // ── Total ───────────────────────────────────────────────────────────────
  totalBox:    { backgroundColor: C.black, padding: "16 24", flexDirection: "row",
                 justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  totalLabel:  { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.white, letterSpacing: 2 },
  totalAmount: { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.yellow },

  orderId: { fontSize: 8, color: "#AAAAAA", marginTop: 20 },
  note:    { fontSize: 9, color: C.gray, marginTop: 12, lineHeight: 1.6 },

  // ── Footer ──────────────────────────────────────────────────────────────
  footer:     { padding: "16 40", borderTopWidth: 1, borderTopColor: "#EEEEEE",
                flexDirection: "row", justifyContent: "space-between", marginTop: "auto" },
  footerText: { fontSize: 8, color: "#999999" },
})

function InvoiceDoc({ d }: { d: InvoicePDFData }) {
  const date = new Date(d.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  })

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>★ Brief Lab Studio</Text>
            <Text style={s.headerSub}>OFFICIAL TAX INVOICE</Text>
          </View>
          <View style={s.paidBadge}>
            <Text style={s.paidText}>✓ PAID</Text>
          </View>
        </View>

        {/* ── Body ── */}
        <View style={s.body}>

          {/* Invoice meta */}
          <Text style={s.label}>Invoice Details</Text>
          <View style={s.row}>
            <Text style={s.key}>Invoice No.</Text>
            <Text style={s.val}>{d.invoiceNo}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Date</Text>
            <Text style={s.val}>{date}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Status</Text>
            <Text style={[s.val, { color: C.green }]}>PAID</Text>
          </View>

          <View style={s.divider} />

          {/* Customer */}
          <Text style={s.label}>Billed To</Text>
          <View style={s.row}>
            <Text style={s.key}>Name</Text>
            <Text style={s.val}>{d.userName}</Text>
          </View>
          <View style={s.row}>
            <Text style={s.key}>Email</Text>
            <Text style={s.val}>{d.userEmail}</Text>
          </View>

          <View style={s.thickDivider} />

          {/* Package */}
          <View style={s.packBox}>
            <Text style={s.packName}>{d.packageName}</Text>
            <Text style={s.packSub}>
              ONE-TIME PURCHASE · DELIVERY IN {d.deliveryDays} DAYS
            </Text>

            <Text style={s.featLabel}>What's Included</Text>
            {d.features.map((f, i) => (
              <View key={i} style={s.featureRow}>
                <View style={s.dot} />
                <Text style={s.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* Total */}
          <View style={s.totalBox}>
            <Text style={s.totalLabel}>TOTAL PAID</Text>
            <Text style={s.totalAmount}>
              {d.currencySymbol}{d.amount} {d.currency}
            </Text>
          </View>

          <Text style={s.orderId}>Order ID: {d.subscriptionId}</Text>
          <Text style={s.note}>
            Thank you for your purchase. Your order has been received and is now being processed.{"\n"}
            A dedicated team member will follow up within {d.deliveryDays} business days.
          </Text>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>© {new Date().getFullYear()} Brief Lab Studio. All rights reserved.</Text>
          <Text style={s.footerText}>Automated invoice — please do not reply.</Text>
        </View>

      </Page>
    </Document>
  )
}

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  const buffer = await renderToBuffer(<InvoiceDoc d={data} />)  // ← direct Buffer milta hai
  return buffer
}