import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import { ZABED_SIGNATURE_BASE64 } from "./signature-base64";
import { HATKHOLA_LOGO_BASE64 } from "./logo-base64";
import {
  HIND_SILIGURI_REGULAR_BASE64,
  HIND_SILIGURI_BOLD_BASE64,
} from "./fonts-base64";

// Register HindSiliguri using Base64 data URIs
// Ensures 100% offline, zero-network font availability and authentic Bengali + Latin glyph rendering
Font.register({
  family: "HindSiliguri",
  fonts: [
    {
      src: HIND_SILIGURI_REGULAR_BASE64,
      fontWeight: "normal",
    },
    {
      src: HIND_SILIGURI_BOLD_BASE64,
      fontWeight: "bold",
    },
  ],
});

export interface InvoiceItem {
  id?: string;
  name: string;
  option?: string;
  qtyG?: number;
  price: number;
  quantity: number;
  isPreOrder?: boolean;
}

export function extractWeightLabel(
  name: string,
  option?: string,
  qtyG?: number,
  price?: number
): string {
  if (option) {
    const match = option.match(/(\d+(?:\.\d+)?\s*(?:kg|g|gm|gram|ml|l)\b)/i);
    if (match) {
      return match[1].trim();
    }
    const matchBn = option.match(/([০-৯]+(?:\.[০-৯]+)?\s*(?:কেজি|গ্রাম|লিটার))/);
    if (matchBn) {
      return matchBn[1].trim();
    }
    const clean = option.split("-")[0].trim();
    if (clean && clean.length <= 15 && clean.toLowerCase() !== "standard pack") {
      return clean;
    }
  }

  if (qtyG && qtyG > 0) {
    if (qtyG >= 1000) {
      const kg = qtyG / 1000;
      return `${Number.isInteger(kg) ? kg : kg} kg`;
    }
    return `${qtyG}g`;
  }

  const nl = (name || "").toLowerCase();
  const pr = price || 0;
  if (nl.includes("ghee") || nl.includes("ঘি")) {
    if (pr >= 2500) return "2 kg";
    if (pr >= 1200) return "1 kg";
    if (pr >= 700) return "500g";
    if (pr >= 350) return "250g";
    return "1 kg";
  }
  if (nl.includes("gur") || nl.includes("গুড়")) {
    if (pr >= 2000) return "5 kg";
    if (pr >= 800) return "2 kg";
    if (pr >= 400) return "1 kg";
    return "1 kg";
  }

  return "";
}

export function formatPackageOption(option?: string, weightLabel?: string): string {
  if (option) {
    const clean = option.split("-")[0].trim();
    if (clean) return clean;
  }
  if (weightLabel) return weightLabel;
  return "Standard Pack";
}

export interface InvoiceOrderData {
  orderId: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNotes?: string;
  deliveryArea?: string;
  deliveryCharge?: number;
  items: InvoiceItem[];
  subtotal?: number;
  voucherDiscount?: number;
  voucherCode?: string;
  depositPaid?: number;
  grandTotal: number;
  paymentMethod?: string;
  isPreOrder?: boolean;
  preOrderNote?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "HindSiliguri",
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: "#f97316",
    borderBottomStyle: "solid",
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandLogo: {
    width: 46,
    height: 46,
    borderRadius: 6,
    marginRight: 12,
    objectFit: "contain",
  },
  brandTextGroup: {
    justifyContent: "center",
  },
  brandTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 18,
    fontWeight: "bold",
    color: "#ea580c",
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontFamily: "HindSiliguri",
    fontSize: 8,
    color: "#64748b",
    marginTop: 1.5,
    letterSpacing: 0.2,
  },
  headerMetaRight: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 14,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  invoiceNumber: {
    fontFamily: "HindSiliguri",
    fontSize: 10,
    fontWeight: "bold",
    color: "#ea580c",
  },
  invoiceDate: {
    fontFamily: "HindSiliguri",
    fontSize: 8,
    color: "#64748b",
    marginTop: 2,
  },

  // Order Type Banner (Regular vs Pre-order)
  orderTypeBadgeContainer: {
    marginBottom: 10,
    padding: 8,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderTypePreOrder: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderStyle: "solid",
  },
  orderTypeRegular: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#10b981",
    borderStyle: "solid",
  },
  badgeTextPreOrder: {
    fontFamily: "HindSiliguri",
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#b45309",
  },
  badgeTextRegular: {
    fontFamily: "HindSiliguri",
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#047857",
  },
  badgeSubText: {
    fontFamily: "HindSiliguri",
    fontSize: 8,
    color: "#475569",
  },

  // 2-Column Info Grid
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoCard: {
    width: "48.5%",
    padding: 9,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
  },
  infoCardTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 8,
    fontWeight: "bold",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    paddingBottom: 2,
  },
  infoLine: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    marginBottom: 2,
    lineHeight: 1.3,
    color: "#334155",
  },
  infoLineBold: {
    fontWeight: "bold",
    color: "#0f172a",
  },

  // Items Table
  table: {
    width: "100%",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    borderBottomStyle: "solid",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  tableRowEven: {
    backgroundColor: "#fafafa",
  },
  thIndex: { fontFamily: "HindSiliguri", width: "6%", fontSize: 8, fontWeight: "bold", color: "#475569" },
  thDesc: { fontFamily: "HindSiliguri", width: "52%", fontSize: 8, fontWeight: "bold", color: "#475569" },
  thOption: { fontFamily: "HindSiliguri", width: "18%", fontSize: 8, fontWeight: "bold", color: "#475569" },
  thQty: { fontFamily: "HindSiliguri", width: "10%", fontSize: 8, fontWeight: "bold", color: "#475569", textAlign: "center" },
  thTotal: { fontFamily: "HindSiliguri", width: "14%", fontSize: 8, fontWeight: "bold", color: "#475569", textAlign: "right" },

  tdIndex: { fontFamily: "HindSiliguri", width: "6%", fontSize: 8, color: "#64748b" },
  tdDesc: { fontFamily: "HindSiliguri", width: "52%", fontSize: 8.5, fontWeight: "bold", color: "#0f172a" },
  tdOption: { fontFamily: "HindSiliguri", width: "18%", fontSize: 8, color: "#475569" },
  tdQty: { fontFamily: "HindSiliguri", width: "10%", fontSize: 8.5, textAlign: "center", color: "#0f172a" },
  tdTotal: { fontFamily: "HindSiliguri", width: "14%", fontSize: 8.5, fontWeight: "bold", textAlign: "right", color: "#0f172a" },

  // Financial Breakdown & Sign-off
  bottomSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 2,
  },
  notesArea: {
    width: "48%",
    padding: 8,
    backgroundColor: "#fff7ed",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ffedd5",
    borderStyle: "solid",
  },
  notesTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 8,
    fontWeight: "bold",
    color: "#c2410c",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  notesContent: {
    fontFamily: "HindSiliguri",
    fontSize: 7.5,
    color: "#7c2d12",
    lineHeight: 1.35,
  },

  totalsArea: {
    width: "48%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  totalLabel: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    color: "#64748b",
  },
  totalValue: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 3,
    borderTopWidth: 1.5,
    borderTopColor: "#ea580c",
    borderTopStyle: "solid",
    borderBottomWidth: 1.5,
    borderBottomColor: "#ea580c",
    borderBottomStyle: "solid",
  },
  grandTotalLabel: {
    fontFamily: "HindSiliguri",
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#ea580c",
  },
  grandTotalValue: {
    fontFamily: "HindSiliguri",
    fontSize: 11,
    fontWeight: "bold",
    color: "#ea580c",
  },

  // Signature Block
  signatureBlock: {
    marginTop: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderStyle: "solid",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureLeft: {
    width: "55%",
  },
  guaranteePledge: {
    fontFamily: "HindSiliguri",
    fontSize: 7.5,
    color: "#64748b",
    lineHeight: 1.35,
  },
  signatureRight: {
    width: "40%",
    alignItems: "center",
  },
  signatureImage: {
    width: 90,
    height: 42,
    objectFit: "contain",
    marginBottom: 2,
  },
  signatoryLine: {
    width: 130,
    borderBottomWidth: 1,
    borderBottomColor: "#94a3b8",
    borderBottomStyle: "solid",
    marginBottom: 3,
  },
  signatoryName: {
    fontFamily: "HindSiliguri",
    fontSize: 9,
    fontWeight: "bold",
    color: "#0f172a",
  },
  signatoryTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 7.5,
    color: "#64748b",
  },

  // Page 2 - Refund Policy Page Styles
  policyHeader: {
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#f97316",
    borderBottomStyle: "solid",
    marginBottom: 10,
    alignItems: "center",
  },
  policyMainTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 14,
    fontWeight: "bold",
    color: "#ea580c",
    letterSpacing: 0.5,
  },
  policySubtitle: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    color: "#475569",
    marginTop: 2,
    textAlign: "center",
  },
  policyPledgeBox: {
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderStyle: "solid",
    borderRadius: 6,
    padding: 8,
    marginBottom: 9,
  },
  policyPledgeTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 9,
    fontWeight: "bold",
    color: "#c2410c",
    marginBottom: 2,
  },
  policyPledgeBn: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    color: "#7c2d12",
    lineHeight: 1.35,
    fontWeight: "bold",
  },
  policyPledgeEn: {
    fontFamily: "HindSiliguri",
    fontSize: 7.5,
    color: "#9a3412",
    marginTop: 2,
    lineHeight: 1.25,
  },
  policyClause: {
    marginBottom: 6,
  },
  clauseHeader: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 1,
  },
  clauseBodyBn: {
    fontFamily: "HindSiliguri",
    fontSize: 8,
    color: "#334155",
    lineHeight: 1.35,
  },
  clauseBodyEn: {
    fontFamily: "HindSiliguri",
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 1,
    lineHeight: 1.2,
  },
  contactBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
  },
  contactTitle: {
    fontFamily: "HindSiliguri",
    fontSize: 8.5,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 3,
  },
  contactItem: {
    fontFamily: "HindSiliguri",
    fontSize: 7.5,
    color: "#475569",
    marginBottom: 1.5,
  },
  pageFooter: {
    fontFamily: "HindSiliguri",
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 7.5,
    color: "#94a3b8",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    borderTopStyle: "solid",
    paddingTop: 4,
  },
});

export function OrderInvoicePdf({ order }: { order: InvoiceOrderData }) {
  const isPreOrder = Boolean(
    order.isPreOrder ||
      order.orderId?.startsWith("PO-") ||
      order.items?.some((i) => i.isPreOrder)
  );

  const subtotal =
    order.subtotal ||
    order.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ||
    0;
  const delivery = order.deliveryCharge || (order.deliveryArea === "outside" ? 120 : 60);
  const discount = order.voucherDiscount || 0;
  const deposit = order.depositPaid || 0;
  const balanceDue = Math.max(0, order.grandTotal - deposit);

  return (
    <Document title={`Invoice-${order.orderId}`} author="Hatkhola Bazar">
      {/* =========================================================================
          PAGE 1: ORDER INVOICE, ITEMS, LEDGER & AUTHORIZED SIGNATURE
          ========================================================================= */}
      <Page size="A4" style={styles.page}>
        {/* Brand Header */}
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <Image src={HATKHOLA_LOGO_BASE64} style={styles.brandLogo} />
            <View style={styles.brandTextGroup}>
              <Text style={styles.brandTitle}>HATKHOLA BAZAR</Text>
              <Text style={styles.brandSubtitle}>
                Authentic Artisanal Food Produce • Village Sourced Purity
              </Text>
              <Text style={styles.brandSubtitle}>
                Helpline: +880 1979-333880 • Email: hatkhola.bazar23@gmail.com
              </Text>
              <Text style={styles.brandSubtitle}>Chattogram, Bangladesh</Text>
            </View>
          </View>

          <View style={styles.headerMetaRight}>
            <Text style={styles.invoiceTitle}>OFFICIAL INVOICE</Text>
            <Text style={styles.invoiceNumber}>Ref #{order.orderId}</Text>
            <Text style={styles.invoiceDate}>
              Date: {new Date(order.createdAt || Date.now()).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Order Type Badge (Regular vs Pre-Order) */}
        <View
          style={[
            styles.orderTypeBadgeContainer,
            isPreOrder ? styles.orderTypePreOrder : styles.orderTypeRegular,
          ]}
        >
          <View>
            <Text
              style={
                isPreOrder ? styles.badgeTextPreOrder : styles.badgeTextRegular
              }
            >
              {isPreOrder
                ? "PRE-ORDER • WINTER HARVEST RESERVATION"
                : "REGULAR ORDER • IMMEDIATE DISPATCH"}
            </Text>
            <Text style={styles.badgeSubText}>
              {isPreOrder
                ? `Seasonal Gachi Harvest Priority • ${order.preOrderNote || "Scheduled Delivery Allocation"}`
                : "Inspected Village Fresh Batch • Standard Courier Transit"}
            </Text>
          </View>
          <Text
            style={
              isPreOrder ? styles.badgeTextPreOrder : styles.badgeTextRegular
            }
          >
            {isPreOrder ? "Advance Demand Committed" : "Direct Village Stock"}
          </Text>
        </View>

        {/* 2-Column Info Grid: Customer Details & Dispatch Spec */}
        <View style={styles.gridRow}>
          {/* Customer Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Customer & Recipient Details</Text>
            <Text style={[styles.infoLine, styles.infoLineBold]}>
              {order.customerName || "Customer"}
            </Text>
            <Text style={styles.infoLine}>Phone: {order.customerPhone || "N/A"}</Text>
            <Text style={styles.infoLine}>
              Address: {order.customerAddress || "Address on File"}
            </Text>
            {order.customerNotes ? (
              <Text style={styles.infoLine}>
                Instructions: {order.customerNotes}
              </Text>
            ) : null}
          </View>

          {/* Billing & Logistics Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Dispatch & Payment Terms</Text>
            <Text style={styles.infoLine}>
              Destination:{" "}
              <Text style={styles.infoLineBold}>
                {order.deliveryArea === "outside" || order.deliveryArea === "Outside Chittagong"
                  ? "Outside Chittagong (Nationwide Courier)"
                  : "Inside Chittagong (Metro Delivery)"}
              </Text>
            </Text>
            <Text style={styles.infoLine}>
              Payment Mode:{" "}
              <Text style={styles.infoLineBold}>
                {order.paymentMethod || "Cash on Delivery (COD)"}
              </Text>
            </Text>
            <Text style={styles.infoLine}>
              Voucher Applied:{" "}
              <Text style={styles.infoLineBold}>
                {order.voucherCode ? order.voucherCode : "None"}
              </Text>
            </Text>
            <Text style={styles.infoLine}>
              Fulfilment Status: <Text style={styles.infoLineBold}>Confirmed</Text>
            </Text>
          </View>
        </View>

        {/* Itemized Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.thIndex}>#</Text>
            <Text style={styles.thDesc}>Product Description</Text>
            <Text style={styles.thOption}>Package / Variant</Text>
            <Text style={styles.thQty}>Qty</Text>
            <Text style={styles.thTotal}>Total (BDT)</Text>
          </View>

          {(order.items || []).map((item, idx) => {
            const weightLabel = extractWeightLabel(
              item.name,
              item.option,
              item.qtyG,
              item.price
            );
            const displayName =
              weightLabel && !item.name.toLowerCase().includes(weightLabel.toLowerCase())
                ? `${item.name} (${weightLabel})`
                : item.name;
            const packageVariant = formatPackageOption(item.option, weightLabel);

            return (
              <View
                key={idx}
                style={[
                  styles.tableRow,
                  idx % 2 === 1 ? styles.tableRowEven : {},
                ]}
              >
                <Text style={styles.tdIndex}>{idx + 1}</Text>
                <Text style={styles.tdDesc}>{displayName}</Text>
                <Text style={styles.tdOption}>{packageVariant}</Text>
                <Text style={styles.tdQty}>{item.quantity}</Text>
                <Text style={styles.tdTotal}>
                  TK {(item.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Financial Breakdown & Sign-Off Section */}
        <View style={styles.bottomSection}>
          {/* Notes Area */}
          <View style={styles.notesArea}>
            <Text style={styles.notesTitle}>Important Customer Notice</Text>
            <Text style={styles.notesContent}>
              Please inspect parcel integrity and product seals upon delivery. Doorstep return is completely free if damaged or compromised during courier transit.
            </Text>
            <Text style={[styles.notesContent, { marginTop: 4 }]}>
              {isPreOrder
                ? "Pre-orders represent committed bookings directly with artisanal sap-tappers (Gachi). You will receive SMS / WhatsApp notification as soon as the batch is dispatched."
                : "Thank you for choosing Hatkhola Bazar for pure traditional village flavors."}
            </Text>
          </View>

          {/* Totals Breakdown */}
          <View style={styles.totalsArea}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>TK {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Delivery & Courier Handling</Text>
              <Text style={styles.totalValue}>TK {delivery.toLocaleString()}</Text>
            </View>
            {discount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: "#16a34a" }]}>
                  Loyalty Discount ({order.voucherCode || "Voucher"})
                </Text>
                <Text style={[styles.totalValue, { color: "#16a34a" }]}>
                  -TK {discount.toLocaleString()}
                </Text>
              </View>
            ) : null}
            {deposit > 0 ? (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: "#2563eb" }]}>
                  Advance Deposit Paid
                </Text>
                <Text style={[styles.totalValue, { color: "#2563eb" }]}>
                  -TK {deposit.toLocaleString()}
                </Text>
              </View>
            ) : null}

            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>
                {deposit > 0 ? "Balance Due on Delivery" : "Total Payable"}
              </Text>
              <Text style={styles.grandTotalValue}>
                TK {balanceDue.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Authorized Signature Block */}
        <View style={styles.signatureBlock}>
          <View style={styles.signatureLeft}>
            <Text style={styles.guaranteePledge}>
              Customer satisfaction is our ultimate achievement. Every batch is certified free from chemical clarifiers (hydrose), adulterants, or artificial essences.
            </Text>
            <Text style={[styles.guaranteePledge, { marginTop: 4 }]}>
              See Page 2 for our comprehensive 10-Day Return & Refund Policy terms.
            </Text>
          </View>

          <View style={styles.signatureRight}>
            <Image src={ZABED_SIGNATURE_BASE64} style={styles.signatureImage} />
            <View style={styles.signatoryLine} />
            <Text style={styles.signatoryName}>Zabed Mahmud</Text>
            <Text style={styles.signatoryTitle}>
              Founder & Operations Lead, Hatkhola Bazar
            </Text>
          </View>
        </View>

        {/* Page 1 Footer */}
        <Text style={styles.pageFooter}>
          Page 1 of 2 • Official Customer Invoice • Hatkhola Bazar Operations
        </Text>
      </Page>

      {/* =========================================================================
          PAGE 2: OFFICIAL RETURN & REFUND POLICY TERMS (BENGALI + ENGLISH)
          ========================================================================= */}
      <Page size="A4" style={styles.page}>
        {/* Policy Header */}
        <View style={styles.policyHeader}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
            <Image src={HATKHOLA_LOGO_BASE64} style={{ width: 28, height: 28, marginRight: 8, objectFit: "contain" }} />
            <Text style={styles.policyMainTitle}>
              HATKHOLA BAZAR RETURN & REFUND POLICY
            </Text>
          </View>
          <Text style={styles.policySubtitle}>
            রিটার্ন এবং রিফান্ড নীতি • কাস্টমারের সন্তুষ্টি আমাদের অর্জন
          </Text>
        </View>

        {/* Sincere Pledge Box */}
        <View style={styles.policyPledgeBox}>
          <Text style={styles.policyPledgeTitle}>
            আমাদের আন্তরিক অঙ্গীকার (Our Sincere Commitment)
          </Text>
          <Text style={styles.policyPledgeBn}>
            আমরা আমাদের রিটার্ন এন্ড রিফান্ড পলিসি যথাসম্ভব সহজ রাখার চেষ্টা করেছি যাতে কাস্টোমার আমাদের বিশ্বাস করতে পারে ইং শা আল্লাহ্। আমরা অবশ্যই এই বিশ্বাসের প্রতিদান দিবো ইং শা আল্লাহ্। কাস্টমারের সন্তুষ্টি আমাদের অর্জন।
          </Text>
          <Text style={styles.policyPledgeEn}>
            We keep our return policy as simple and transparent as possible to earn and honor your complete trust Insha Allah.
          </Text>
        </View>

        {/* 1. Return Window */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ১. রিটার্ন উইন্ডো (10-Day Return Window)
          </Text>
          <Text style={styles.clauseBodyBn}>
            হাটখোলা বাজার থেকে কেনা সমস্ত পণ্য কেনার তারিখ থেকে ১০ দিনের মধ্যে ফেরত দেওয়া যেতে পারে।
          </Text>
          <Text style={styles.clauseBodyEn}>
            All items purchased from Hatkhola Bazar can be returned within 10 days from the purchase date.
          </Text>
        </View>

        {/* 2. Return Conditions */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ২. রিটার্ন শর্তাবলী (Return Conditions)
          </Text>
          <Text style={styles.clauseBodyBn}>
            পণ্যগুলি অবশ্যই তাদের মূল অবস্থায়, অব্যবহৃত এবং সমস্ত ট্যাগ ও লেবেল সংযুক্ত থাকতে হবে। নষ্ট হওয়া পণ্য ফেরত দেওয়া যাবে না। কাস্টমাইজড বা ব্যক্তিগতকৃত পণ্য সাধারণত ফেরতযোগ্য নয়।
          </Text>
          <Text style={styles.clauseBodyEn}>
            Items must be in original unused condition with all tags and seals intact. Spoiled or custom items are non-refundable.
          </Text>
        </View>

        {/* 3. Return Process */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ৩. রিটার্ন প্রক্রিয়া (Return Process)
          </Text>
          <Text style={styles.clauseBodyBn}>
            রিটার্ন করতে আমাদের সাথে 01979333880 বা hatkhola.bazar23@gmail.com অথবা ফেসবুক পেজে যোগাযোগ করুন। আপনার অর্ডার নম্বর এবং কারণ জানালে পণ্য ফেরত দেওয়ার পূর্ণ নির্দেশনা দেওয়া হবে।
          </Text>
          <Text style={styles.clauseBodyEn}>
            To return, contact 01979333880, email hatkhola.bazar23@gmail.com, or our Facebook page with your Order Reference ID.
          </Text>
        </View>

        {/* 4. Return Shipping */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ৪. ফ্রি রিটার্ন শিপিং (Free Return Shipping)
          </Text>
          <Text style={styles.clauseBodyBn}>
            যদি পণ্যটি ত্রুটিপূর্ণ হয় বা ভুল পণ্য পাঠানো হয়, আমরা সম্পূর্ণ রিটার্ন শিপিং খরচ বহন করব।
          </Text>
          <Text style={styles.clauseBodyEn}>
            If a product is defective or incorrect, Hatkhola Bazar covers 100% of return shipping costs.
          </Text>
        </View>

        {/* 5. Refund Method */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ৫. রিফান্ড পদ্ধতি (Prompt Refund Execution)
          </Text>
          <Text style={styles.clauseBodyBn}>
            ফেরত পণ্য পাওয়ার ৩-৫ কার্যদিবসের মধ্যে কাস্টমারের পেইমেন্ট মেথড (নগদ, বিকাশ, সেলফিন) এ রিফান্ড প্রদান করা হবে ইং শা আল্লাহ্।
          </Text>
          <Text style={styles.clauseBodyEn}>
            Refunds are disbursed via bKash, Nagad, Cellfin, or Cash within 3-5 business days Insha Allah.
          </Text>
        </View>

        {/* 6. Product Exchange */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ৬. পণ্য বিনিময় (Product Exchange)
          </Text>
          <Text style={styles.clauseBodyBn}>
            কাস্টোমার চাইলে পণ্য এক্সচেঞ্জ করে নিতে পারেন ইং শা আল্লাহ্। এক্সচেঞ্জে সহায়তার জন্য দয়া করে আমাদের সাথে যোগাযোগ করুন।
          </Text>
          <Text style={styles.clauseBodyEn}>
            Instant product replacement/exchange is available on customer request Insha Allah.
          </Text>
        </View>

        {/* 7. Damaged or Incorrect Goods */}
        <View style={styles.policyClause}>
          <Text style={styles.clauseHeader}>
            ৭. ক্ষতিগ্রস্ত বা ভুল পণ্য (Damaged or Incorrect Goods)
          </Text>
          <Text style={styles.clauseBodyBn}>
            যদি আপনি ক্ষতিগ্রস্ত বা ভুল পণ্য পান, তাহলে দয়া করে প্রাপ্তির ১০ দিনের মধ্যে জানান। আমরা প্রতিস্থাপন বা রিফান্ডের পূর্ণ নির্দেশনা প্রদান করব।
          </Text>
          <Text style={styles.clauseBodyEn}>
            Report transit damages or incorrect items within 10 days for immediate replacement dispatch or refund.
          </Text>
        </View>

        {/* Support Help Desk Box */}
        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>
            অফিসিয়াল কাস্টমার সাপোর্ট ডেস্ক (Customer Support Channels):
          </Text>
          <Text style={styles.contactItem}>
            • হটলাইন: 01979333880 (+880 1979-333880) • হোয়াটসঅ্যাপ: +880 1979-333880
          </Text>
          <Text style={styles.contactItem}>
            • অফিসিয়াল ইমেইল: hatkhola.bazar23@gmail.com • ফেসবুক পেজ: facebook.com/hatkholabazar
          </Text>
        </View>

        {/* Page 2 Footer */}
        <Text style={styles.pageFooter}>
          পৃষ্ঠা ২ এর ২ • হাটখোলা বাজার কাস্টমার প্রটেকশন পলিসি • Hatkhola Bazar Assurance
        </Text>
      </Page>
    </Document>
  );
}

export default OrderInvoicePdf;
