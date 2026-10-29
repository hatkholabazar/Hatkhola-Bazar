/**
 * Admin API Client for Hatkhola Bazar Financial & Inventory Management
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const ADMIN_SECRET =
  process.env.NEXT_PUBLIC_ADMIN_SECRET || "hatkhola-dev-admin-secret-2026";

export interface IPreOrderConfig {
  expectedDate?: string;
  expectedNote?: string;
  depositRequired: boolean;
  depositAmount?: number;
  depositPercent?: number;
  maxQtyG?: number;
  closesAt?: string;
  cancellationPolicyText?: string;
}

export interface IAdminProduct {
  _id?: string;
  code: string;
  slug: string;
  name: string;
  baseUnit: "g";
  sellingOptions: {
    label: string;
    qtyG: number;
    sellingPrice: number;
  }[];
  isSeasonal: boolean;
  isActive: boolean;
  availabilityMode?: "in_stock" | "pre_order" | "out_of_stock";
  preOrder?: IPreOrderConfig;
  lowStockThresholdG: number;
  marginPercent: number;
  description?: string;
  benefits?: string[];
  image?: string;
  stockGrams?: number;
  openPreOrderGrams?: number;
  stockSuggestion?: string | null;
}

export interface IPreOrderItem {
  product: string;
  productCode: string;
  productName: string;
  optionLabel: string;
  qtyG: number;
  quotedPrice: number;
}

export interface IPreOrderDeposit {
  depositId: string;
  amount: number;
  method: "bkash" | "nagad" | "bank" | "cash";
  trxId?: string;
  receivedAt: string;
  attachment?: {
    publicId: string;
    url: string;
    kind: "payment_receipt";
  };
}

export interface IPreOrderStatusHistory {
  status: "pending" | "confirmed" | "ready" | "fulfilled" | "cancelled" | "refunded";
  changedAt: string;
  changedBy: string;
  note?: string;
}

// ==================== PATHAO & SHIPMENT INTERFACES ====================
export interface IPathaoStore {
  store_id: number;
  store_name: string;
  store_address: string;
  is_active: boolean;
}

export interface IPathaoCity {
  id: number;
  name: string;
}

export interface IPathaoZone {
  id: number;
  name: string;
}

export interface IPathaoArea {
  id: number;
  name: string;
  homeDeliveryAvailable: boolean;
  pickupAvailable: boolean;
}

export interface IPathaoStatus {
  connected: boolean;
  storesCount: number;
  defaultStore?: IPathaoStore;
  message: string;
}

export interface IPathaoStatusInfo {
  slug: string;
  labelEn: string;
  labelBn: string;
  isFinal: boolean;
  progressStep: "Confirmed" | "Sent to courier" | "Out for delivery" | "Delivered" | "Returned";
  color: "amber" | "blue" | "indigo" | "emerald" | "rose" | "slate";
}

export const PATHAO_STATUS_MAP: Record<string, Omit<IPathaoStatusInfo, "slug">> = {
  pending: {
    labelEn: "Pending Courier Pickup",
    labelBn: "পিকআপের অপেক্ষায়",
    isFinal: false,
    progressStep: "Sent to courier",
    color: "amber",
  },
  accepted: {
    labelEn: "Accepted by Courier",
    labelBn: "কুরিয়ার গ্রহণ করেছে",
    isFinal: false,
    progressStep: "Sent to courier",
    color: "blue",
  },
  in_transit: {
    labelEn: "In Transit",
    labelBn: "ট্রানজিটে রয়েছে",
    isFinal: false,
    progressStep: "Sent to courier",
    color: "blue",
  },
  picked_up: {
    labelEn: "Picked Up by Courier",
    labelBn: "পিকআপ সম্পন্ন",
    isFinal: false,
    progressStep: "Sent to courier",
    color: "indigo",
  },
  assigned_for_delivery: {
    labelEn: "Assigned for Delivery",
    labelBn: "ডেলিভারির জন্য বরাদ্দ",
    isFinal: false,
    progressStep: "Out for delivery",
    color: "indigo",
  },
  out_for_delivery: {
    labelEn: "Out for Delivery",
    labelBn: "ডেলিভারির জন্য বের হয়েছে",
    isFinal: false,
    progressStep: "Out for delivery",
    color: "indigo",
  },
  delivered: {
    labelEn: "Delivered",
    labelBn: "সফলভাবে ডেলিভারি হয়েছে",
    isFinal: true,
    progressStep: "Delivered",
    color: "emerald",
  },
  partial_delivered: {
    labelEn: "Partially Delivered",
    labelBn: "আংশিক ডেলিভারি সম্পন্ন",
    isFinal: true,
    progressStep: "Delivered",
    color: "emerald",
  },
  returned: {
    labelEn: "Returned to Merchant",
    labelBn: "রিটার্ন হয়েছে",
    isFinal: true,
    progressStep: "Returned",
    color: "rose",
  },
  cancelled: {
    labelEn: "Consignment Cancelled",
    labelBn: "বাতিল করা হয়েছে",
    isFinal: true,
    progressStep: "Returned",
    color: "rose",
  },
  on_hold: {
    labelEn: "On Hold",
    labelBn: "সাময়িকভাবে স্থগিত",
    isFinal: false,
    progressStep: "Sent to courier",
    color: "amber",
  },
  failed: {
    labelEn: "Delivery Attempt Failed",
    labelBn: "ডেলিভারি ব্যর্থ",
    isFinal: false,
    progressStep: "Sent to courier",
    color: "rose",
  },
};

export function resolvePathaoStatus(slugOrStatus?: string): IPathaoStatusInfo {
  const normalizedSlug = (slugOrStatus || "unknown")
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_");

  if (PATHAO_STATUS_MAP[normalizedSlug]) {
    return {
      slug: normalizedSlug,
      ...PATHAO_STATUS_MAP[normalizedSlug],
    };
  }

  const humanized = normalizedSlug
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  return {
    slug: normalizedSlug,
    labelEn: humanized,
    labelBn: humanized,
    isFinal: false,
    progressStep: "Sent to courier",
    color: "slate",
  };
}

export interface IShipmentStatusHistory {
  status: string;
  pathaoStatus?: string;
  slug?: string;
  label?: string;
  pathaoUpdatedAt?: string;
  fetchedAt?: string;
  note?: string;
  timestamp: string;
}

export interface IShipment {
  _id: string;
  orderType: "sale" | "preorder";
  orderId: string;
  orderNo: string;
  courier: "pathao";
  consignmentId?: string;
  merchantOrderId: string;
  trackingUrl?: string;
  request: Record<string, any>;
  amountToCollect: number;
  itemWeightKg: number;
  deliveryFee: number;
  codFee: number;
  pathaoStatus?: string;
  pathaoStatusSlug?: string;
  pathaoUpdatedAt?: string;
  finalStatus?: boolean;
  lastRefreshedAt?: string;
  statusHistory: IShipmentStatusHistory[];
  status: "creating" | "created" | "failed" | "unknown" | "cancelled_manually";
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface IDispatchToPathaoInput {
  recipientName: string;
  recipientPhone: string;
  recipientSecondaryPhone?: string;
  recipientAddress: string;
  recipientCity?: number | null;
  recipientZone?: number | null;
  recipientArea?: number | null;
  recipientCityName?: string;
  recipientZoneName?: string;
  recipientAreaName?: string;
  storeId?: number;
  deliveryType?: 48 | 12;
  itemType?: 1 | 2;
  specialInstruction?: string;
  weightOverride?: number;
}

export interface IPreOrderRefundRecord {
  amount: number;
  type: "refund" | "forfeit";
  reason: string;
  processedAt: string;
  processedBy: string;
  trxId?: string;
}

export interface IPreOrder {
  _id: string;
  preOrderNo: string;
  customerName: string;
  customerPhone: string;
  channel: string;
  address?: string;
  items: IPreOrderItem[];
  quotedTotal: number;
  expectedDate?: string;
  note?: string;
  deposits: IPreOrderDeposit[];
  depositTotal: number;
  refundedTotal: number;
  forfeitedTotal: number;
  status: "pending" | "confirmed" | "ready" | "fulfilled" | "cancelled" | "refunded";
  statusHistory: IPreOrderStatusHistory[];
  linkedBatchId?: any;
  fulfilledSaleId?: any;
  cancelReason?: string;
  refunds: IPreOrderRefundRecord[];
  createdAt: string;
}

export interface IPreOrderMetrics {
  openCount: number;
  openGrams: number;
  depositsHeld: number;
  forfeitedIncome: number;
  productDemands: {
    productId: string;
    productName: string;
    productCode: string;
    openGrams: number;
    availableStockGrams: number;
    shortfallGrams: number;
  }[];
}

export interface IAuditLogItem {
  _id: string;
  entityType: string;
  entityId: string;
  action: string;
  actor: string;
  fromState?: any;
  toState?: any;
  metadata?: any;
  createdAt: string;
}

export interface IAttachmentMeta {
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
  kind: string;
  caption?: string;
  uploadedAt: string;
  url?: string;
}

export interface IStockBatch {
  _id: string;
  batchNo: string;
  product: IAdminProduct | string;
  purchasedAt: string;
  receivedAt: string;
  supplierName: string;
  supplierPhone: string;
  orderedQtyG: number;
  receivedQtyG: number;
  qtyRemainingG: number;
  productCost: number;
  courierCharge: number;
  codFee: number;
  otherExtraCost: number;
  extraCost: number;
  totalCost: number;
  costRemaining: number;
  unitCostPerKg?: number;
  shortageG?: number;
  shortagePercent?: number;
  paymentMethod: string;
  referenceType?: string;
  referenceValue?: string;
  courierName?: string;
  attachments?: IAttachmentMeta[];
  status: "active" | "depleted" | "voided";
  voidReason?: string;
  voidedAt?: string;
  note?: string;
  createdAt: string;
}

export interface ISaleAllocation {
  batchId: string;
  batchNo: string;
  qtyG: number;
  cost: number;
}

export interface ISaleItem {
  _id?: string;
  product: IAdminProduct | string;
  optionLabel: string;
  qtyG: number;
  sellingPrice: number;
  allocations: ISaleAllocation[];
}

export interface ISale {
  _id: string;
  soldAt: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  courierName?: string;
  courierCharge?: number;
  courierTrackingId?: string;
  deliveryNotes?: string;
  paymentTrxId?: string;
  channel: string;
  paymentMethod: string;
  items: ISaleItem[];
  giveawayG: number;
  packagingCost: number;
  totalRevenue: number;
  totalCogs: number;
  grossProfit: number;
  status: "completed" | "voided";
  voidReason?: string;
  voidedAt?: string;
  createdAt: string;
}

export interface IDashboardReport {
  today: {
    revenue: number;
    cogs: number;
    profit: number;
    orderCount: number;
  };
  totalStockValue: number;
  totalStockWeightKg: number;
  activeBatchCount: number;
  lowStockProducts: {
    code: string;
    name: string;
    currentStockKg: number;
    thresholdKg: number;
    isLow: boolean;
  }[];
  recentSales: ISale[];
  recentBatches: IStockBatch[];
}

export interface ICostingItem {
  batchId: string;
  batchNo: string;
  productCode: string;
  productName: string;
  purchasedAt: string;
  receivedQtyKg: number;
  qtyRemainingKg: number;
  unitCostPerKg: number;
  totalCost: number;
  costRemaining: number;
  status: string;
  suggestedPrices: {
    label: string;
    qtyG: number;
    costOfQty: number;
    actualPrice: number;
    suggestedPrice: number;
    marginPercent: number;
  }[];
}

class AdminApiClient {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
    };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("hatkhola_admin_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  // Dashboard reports
  async getDashboardReport(): Promise<IDashboardReport> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/reports`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.report;
      }
    } catch {
      // Fallback
    }
    return this.getMockDashboard();
  }

  // Batches
  async getBatches(params?: {
    status?: string;
    product?: string;
    search?: string;
  }): Promise<IStockBatch[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${BACKEND_URL}/api/admin/batches?${query}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.batches;
      }
    } catch {
      // Fallback
    }
    return this.getLocalBatches();
  }

  async getBatchDetail(id: string): Promise<{
    batch: IStockBatch;
    allocationsHistory: any[];
  }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/batches/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to load batch detail");
    }
    return res.json();
  }

  async createBatch(payload: any): Promise<IStockBatch> {
    const res = await fetch(`${BACKEND_URL}/api/admin/batches`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.requiresConfirmation) {
        const err: any = new Error(data.message);
        err.requiresConfirmation = true;
        err.existingBatchNo = data.existingBatchNo;
        throw err;
      }
      throw new Error(data.error || "Failed to create batch");
    }
    return data.batch;
  }

  async voidBatch(id: string, reason: string): Promise<IStockBatch> {
    const res = await fetch(`${BACKEND_URL}/api/admin/batches/${id}/void`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ voidReason: reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to void batch");
    return data.batch;
  }

  // Sales
  async getSales(params?: {
    status?: string;
    search?: string;
  }): Promise<ISale[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res = await fetch(`${BACKEND_URL}/api/admin/sales?${query}`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.sales;
      }
    } catch {
      // Fallback
    }
    return this.getLocalSales();
  }

  async previewSaleAllocation(payload: {
    items: { productId: string; qtyG: number; sellingPrice: number }[];
    giveawayG?: number;
  }): Promise<any> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/sales/preview`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Insufficient stock or error");
      return data;
    } catch (err: any) {
      if (err.message && err.message.includes("Insufficient stock")) {
        throw err;
      }
      // If backend is offline or unreachable, return empty allocations without crashing the UI
      return { allocations: [], offline: true };
    }
  }

  async createSale(payload: any): Promise<ISale> {
    const res = await fetch(`${BACKEND_URL}/api/admin/sales`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to record sale");
    return data.sale;
  }

  async voidSale(id: string, reason: string): Promise<ISale> {
    const res = await fetch(`${BACKEND_URL}/api/admin/sales/${id}/void`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ voidReason: reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to void sale");
    return data.sale;
  }

  async returnSaleItem(
    saleId: string,
    itemId: string,
    returnedQtyG: number,
    reason: string
  ): Promise<any> {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/sales/${saleId}/return`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ saleItemId: itemId, returnedQtyG, reason }),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to process item return");
    return data;
  }

  // Costing & Margins
  async getCosting(): Promise<{
    costingSummary: ICostingItem[];
    stockSummary: any[];
  }> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/costing`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return { costingSummary: [], stockSummary: [] };
  }

  // Adjustments & Physical Count
  async createAdjustment(payload: {
    productId: string;
    batchId?: string;
    qtyG: number;
    type: "wastage" | "sample" | "correction";
    reason: string;
  }): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/admin/adjustments`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create adjustment");
    return data;
  }

  async reconcilePhysicalCount(payload: {
    productId: string;
    actualQtyG: number;
    reason: string;
  }): Promise<any> {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/adjustments/physical-count`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Physical count adjustment failed");
    return data;
  }

  // Products
  async getProducts(): Promise<IAdminProduct[]> {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/products`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        return data.products;
      }
    } catch {
      // Fallback
    }
    return [
      {
        _id: "prod-ghee-1",
        code: "GHEE",
        slug: "danadar-ghee",
        name: "Danadar Ghee (দানাদার ঘি)",
        baseUnit: "g",
        sellingOptions: [
          { label: "1 kg Glass Jar", qtyG: 1000, sellingPrice: 1400 },
          { label: "500 g Glass Jar", qtyG: 500, sellingPrice: 750 },
          { label: "250 g Trial Jar", qtyG: 250, sellingPrice: 400 },
        ],
        isSeasonal: false,
        isActive: true,
        lowStockThresholdG: 5000,
        marginPercent: 25,
      },
      {
        _id: "prod-gur-1",
        code: "GUR",
        slug: "khejur-gur",
        name: "Khejur Patali Gur (খেজুরের পাটালি গুড়)",
        baseUnit: "g",
        sellingOptions: [
          { label: "1 kg Traditional Block", qtyG: 1000, sellingPrice: 450 },
          { label: "2 kg Family Pack", qtyG: 2000, sellingPrice: 880 },
          { label: "5 kg Saver Pack", qtyG: 5000, sellingPrice: 2150 },
        ],
        isSeasonal: true,
        isActive: true,
        lowStockThresholdG: 10000,
        marginPercent: 30,
      },
    ];
  }

  async upsertProduct(product: Partial<IAdminProduct>): Promise<IAdminProduct> {
    const res = await fetch(`${BACKEND_URL}/api/admin/products`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save product");
    return data.product;
  }

  async updateProduct(id: string, product: Partial<IAdminProduct>): Promise<IAdminProduct> {
    const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(product),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update product");
    return data.product;
  }

  async deleteProduct(id: string): Promise<{ success: boolean; deleted?: boolean; archived?: boolean; message: string }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/products/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete product");
    return data;
  }

  // Pre-Orders Management
  async getPreOrders(filter: { status?: string; productId?: string; search?: string } = {}): Promise<{ preOrders: IPreOrder[]; total: number }> {
    const params = new URLSearchParams();
    if (filter.status && filter.status !== "all") params.set("status", filter.status);
    if (filter.productId && filter.productId !== "all") params.set("productId", filter.productId);
    if (filter.search) params.set("search", filter.search);

    const res = await fetch(`${BACKEND_URL}/api/admin/preorders?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch pre-orders");
    return { preOrders: data.preOrders || [], total: data.total || 0 };
  }

  async getPreOrderDetail(id: string): Promise<IPreOrder> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/${id}`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch pre-order detail");
    return data.preOrder;
  }

  async getPreOrderMetrics(): Promise<IPreOrderMetrics> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/metrics`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch pre-order metrics");
    return data.metrics;
  }

  async createPreOrder(payload: any): Promise<IPreOrder> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Failed to create pre-order");
    return data.preOrder;
  }

  async addPreOrderDeposit(id: string, deposit: any): Promise<IPreOrder> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/${id}/deposits`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(deposit),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to record deposit");
    return data.preOrder;
  }

  async allocateBatchToPreOrder(id: string, batchId: string): Promise<IPreOrder> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/${id}/allocate-batch`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ batchId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to allocate batch");
    return data.preOrder;
  }

  async autoAllocateBatchToOpenPreOrders(productId: string, batchId: string): Promise<{ allocatedCount: number; allocatedGrams: number; message: string }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/allocate-batch`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ productId, batchId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to auto-allocate batch to open pre-orders");
    return data;
  }

  async fulfilPreOrder(id: string, payload: any): Promise<{ sale: any; preOrder: IPreOrder; remainingPreOrder?: IPreOrder }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/${id}/fulfil`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || "Failed to fulfil pre-order");
    return data;
  }

  async cancelPreOrder(id: string, payload: any): Promise<IPreOrder> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/${id}/cancel`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to cancel pre-order");
    return data.preOrder;
  }

  async updatePreOrderStatus(id: string, status: string, note?: string): Promise<IPreOrder> {
    const res = await fetch(`${BACKEND_URL}/api/admin/preorders/${id}/status`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify({ status, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update status");
    return data.preOrder;
  }

  async getProductAuditLogs(productId: string): Promise<IAuditLogItem[]> {
    const res = await fetch(`${BACKEND_URL}/api/admin/products/${productId}/audit`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return [];
    return data.logs || [];
  }

  // Cloudinary upload signature
  async getUploadSignature(kind: string): Promise<{
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
    type: string;
  }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/uploads/sign`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ kind }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to obtain upload signature");
    return data;
  }

  // ==================== PATHAO COURIER METHODS ====================

  async getPathaoStores(): Promise<IPathaoStore[]> {
    const res = await fetch(`${BACKEND_URL}/api/admin/pathao/stores`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch Pathao stores");
    return data.stores || [];
  }

  async getPathaoCities(): Promise<IPathaoCity[]> {
    const res = await fetch(`${BACKEND_URL}/api/admin/pathao/locations/cities`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch Pathao cities");
    return data.cities || [];
  }

  async getPathaoZones(cityId: number): Promise<IPathaoZone[]> {
    const res = await fetch(`${BACKEND_URL}/api/admin/pathao/locations/cities/${cityId}/zones`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch Pathao zones");
    return data.zones || [];
  }

  async getPathaoAreas(zoneId: number): Promise<IPathaoArea[]> {
    const res = await fetch(`${BACKEND_URL}/api/admin/pathao/locations/zones/${zoneId}/areas`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch Pathao areas");
    return data.areas || [];
  }

  async calculatePathaoPrice(payload: any): Promise<{ price: number; planId?: number }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/pathao/price-plan`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to calculate delivery fee");
    return data;
  }

  async getPathaoStatus(): Promise<IPathaoStatus> {
    const res = await fetch(`${BACKEND_URL}/api/admin/pathao/status`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to check Pathao status");
    return data;
  }

  async dispatchOrderToPathao(
    type: "sale" | "preorder",
    id: string,
    payload: IDispatchToPathaoInput
  ): Promise<{ shipment: IShipment; order: any }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/orders/${type}/${id}/pathao`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to dispatch order to Pathao");
    return data;
  }

  async getOrderShipment(type: "sale" | "preorder", id: string): Promise<IShipment | null> {
    const res = await fetch(`${BACKEND_URL}/api/admin/orders/${type}/${id}/shipment`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) return null;
    return data.shipment || null;
  }

  async getShipmentStatus(id: string): Promise<IShipment> {
    const res = await fetch(`${BACKEND_URL}/api/admin/shipments/${id}/status`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch shipment status");
    return data.shipment;
  }

  async refreshShipment(id: string): Promise<IShipment> {
    const res = await fetch(`${BACKEND_URL}/api/admin/shipments/${id}/refresh`, {
      method: "POST",
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to refresh shipment status");
    return data.shipment;
  }

  async trackOrderPublic(
    orderNo: string,
    phone: string
  ): Promise<{
    success: boolean;
    statusLabel: { en: string; bn: string };
    step: "Confirmed" | "Sent to courier" | "Out for delivery" | "Delivered" | "Returned";
    updatedAt: string;
  }> {
    const res = await fetch(`${BACKEND_URL}/api/public/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNo, phone }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No order found with these details");
    return data;
  }

  async cancelShipment(id: string, reason: string): Promise<IShipment> {
    const res = await fetch(`${BACKEND_URL}/api/admin/shipments/${id}/cancel`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to cancel shipment");
    return data.shipment;
  }

  async getShipments(query?: {
    status?: string;
    orderType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ shipments: IShipment[]; pagination: any }> {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (query?.orderType) params.set("orderType", query.orderType);
    if (query?.search) params.set("search", query.search);
    if (query?.page) params.set("page", String(query.page));
    if (query?.limit) params.set("limit", String(query.limit));

    const res = await fetch(`${BACKEND_URL}/api/admin/shipments?${params.toString()}`, {
      headers: this.getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch shipments");
    return data;
  }

  getShipmentsCsvUrl(query?: { status?: string; orderType?: string }): string {
    const params = new URLSearchParams();
    if (query?.status) params.set("status", query.status);
    if (query?.orderType) params.set("orderType", query.orderType);
    return `${BACKEND_URL}/api/admin/shipments/export/csv?${params.toString()}`;
  }

  // Local storage mock fallbacks for standalone client demo
  private getMockDashboard(): IDashboardReport {
    return {
      today: {
        revenue: 12450,
        cogs: 8600,
        profit: 3850,
        orderCount: 6,
      },
      totalStockValue: 148500,
      totalStockWeightKg: 135.5,
      activeBatchCount: 4,
      lowStockProducts: [
        {
          code: "GHEE",
          name: "Danadar Ghee (দানাদার ঘি)",
          currentStockKg: 3.2,
          thresholdKg: 5.0,
          isLow: true,
        },
      ],
      recentSales: [],
      recentBatches: [],
    };
  }

  private getLocalBatches(): IStockBatch[] {
    return [];
  }

  private getLocalSales(): ISale[] {
    return [];
  }
}

export const adminApi = new AdminApiClient();

