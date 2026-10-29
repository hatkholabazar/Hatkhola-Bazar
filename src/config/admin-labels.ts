/**
 * Bilingual English / Bengali labels and helper formatters for Hatkhola Bazar Admin Console
 */

export const ADMIN_LABELS = {
  currency: "৳",
  baseUnit: "g",
  displayUnit: "kg",

  // Couriers in Bangladesh
  couriers: [
    { value: "Pathao", label: "Pathao Courier" },
    { value: "Steadfast", label: "Steadfast Courier" },
    { value: "RedX", label: "RedX Delivery" },
    { value: "Sundarban", label: "Sundarban Courier Service" },
    { value: "SA Paribahan", label: "S.A. Paribahan" },
    { value: "Paperfly", label: "Paperfly" },
    { value: "Other", label: "Other / Local Van" },
  ],

  // Reference Types
  referenceTypes: [
    { value: "courier_tracking", label: "Courier Tracking Consignment ID" },
    { value: "memo_invoice", label: "Supplier Paper Memo / Invoice" },
    { value: "online_order_id", label: "Online / Portal Order ID" },
    { value: "payment_trxid", label: "bKash / Nagad / Bank TrxID" },
    { value: "other", label: "Other External Reference" },
    { value: "none", label: "None / Trust Direct Purchase" },
  ],

  // Payment Methods
  paymentMethods: [
    { value: "cash_on_delivery", label: "Cash on Delivery (COD)" },
    { value: "bkash", label: "bKash" },
    { value: "nagad", label: "Nagad" },
    { value: "bank", label: "Bank Transfer" },
    { value: "cash", label: "Cash in Hand" },
    { value: "other", label: "Other" },
  ],

  // Attachment Kinds
  attachmentKinds: [
    { value: "whatsapp_chat", label: "WhatsApp Chat / Deal Screenshot" },
    { value: "courier_slip", label: "Courier Parcel Slip / Consignment" },
    { value: "payment_receipt", label: "Payment Voucher / Trx Receipt" },
    { value: "product_photo", label: "Physical Product Photo" },
    { value: "other", label: "Other Documentation" },
  ],

  // Sales Channels
  salesChannels: [
    { value: "whatsapp", label: "WhatsApp Direct" },
    { value: "website", label: "Online Storefront" },
    { value: "messenger", label: "Facebook Messenger" },
    { value: "phone", label: "Direct Phone Call" },
    { value: "other", label: "Walk-in / Exhibition" },
  ],

  // Adjustment Types
  adjustmentTypes: [
    { value: "wastage", label: "Artisanal Wastage / Boiling Evaporation" },
    { value: "sample", label: "Tasting Sample / Gift / Promotion" },
    { value: "correction", label: "Audit Weight Correction" },
    { value: "physical_count", label: "Physical Inventory Count Reconcile" },
  ],
};

/**
 * Format integer taka with comma grouping and ৳ symbol
 */
export function formatTaka(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "৳ 0";
  return `৳ ${Math.round(amount).toLocaleString("en-BD")}`;
}

/**
 * Convert grams to readable kg / g string
 */
export function formatGramsToKg(grams: number | undefined | null): string {
  if (grams === undefined || grams === null || isNaN(grams)) return "0 kg";
  if (grams < 1000) return `${grams} g`;
  const kg = grams / 1000;
  return `${kg % 1 === 0 ? kg : kg.toFixed(2)} kg`;
}

/**
 * Convert user kg input to integer grams
 */
export function kgToGrams(kg: number | string): number {
  const num = typeof kg === "string" ? parseFloat(kg) : kg;
  if (isNaN(num) || num <= 0) return 0;
  return Math.round(num * 1000);
}

/**
 * Format short date (e.g. 29 Oct 2026)
 */
export function formatAdminDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

