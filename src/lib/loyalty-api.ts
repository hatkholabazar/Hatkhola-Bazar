/**
 * Loyalty & Voucher API Client for Hatkhola Bazar
 * Completely zero emoji, strict types, integer Taka
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const ADMIN_SECRET =
  process.env.NEXT_PUBLIC_ADMIN_SECRET || "hatkhola-dev-admin-secret-2026";

function getAdminHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("hatkhola_admin_token") : null;
  return {
    "Content-Type": "application/json",
    "x-admin-secret": ADMIN_SECRET,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface IPublicLoyaltySettings {
  loyaltyEnabled: boolean;
  targetAmount: number;
  rewardAmount: number;
  minOrderToRedeem: number;
  voucherExpiryDays: number;
}

export interface ILoyaltyAccount {
  _id: string;
  phone: string;
  userId?: string;
  name?: string;
  progressBalance: number;
  pendingAmount: number;
  lifetimeEligibleSpend: number;
  vouchersIssuedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IVoucher {
  _id: string;
  code: string;
  source: "loyalty" | "custom" | "manual" | "compensation";
  discountType: "fixed" | "percent";
  value: number;
  maxDiscountAmount?: number;
  minOrderAmount: number;
  startsAt: string;
  expiresAt: string;
  usageLimitTotal?: number | null;
  usageLimitPerCustomer: number;
  usedCount: number;
  reservedCount: number;
  assignedPhone?: string | null;
  assignedUserId?: string | null;
  applicableProducts: string[];
  excludedProducts: string[];
  ignoreCap: boolean;
  stackable: boolean;
  status: "active" | "paused" | "redeemed" | "expired" | "voided" | "review";
  note?: string;
  voidReason?: string;
  createdBy: string;
  createdAt: string;
}

export interface ILoyaltyLedgerEntry {
  _id: string;
  accountId: string;
  type:
    | "earn_pending"
    | "earn_eligible"
    | "reversal"
    | "manual_credit"
    | "manual_debit"
    | "voucher_issue"
    | "import"
    | "welcome";
  amount: number;
  orderType: "sale" | "preorder" | "none";
  orderId?: string;
  orderNo?: string;
  eligibleAt?: string;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

export interface IVoucherEvaluationResult {
  isValid: boolean;
  code: string;
  error?: string;
  voucher?: IVoucher;
  eligibleSubtotal: number;
  discountAmount: number;
  newTotal: number;
  allocations: {
    productId: string;
    productName: string;
    lineSubtotal: number;
    discountAmount: number;
  }[];
}

export interface ILoyaltyOverviewMetrics {
  totalLoyaltyAccounts: number;
  activeLoyaltyVouchers: number;
  totalVouchersIssued: number;
  totalVouchersRedeemed: number;
  totalDiscountGivenTaka: number;
  outstandingVoucherLiabilityTaka: number;
  expiredUnusedCount: number;
  vouchersInReviewCount: number;
}

export interface ILoyaltySettingsDoc {
  loyaltyEnabled: boolean;
  targetAmount: number;
  rewardAmount: number;
  minOrderToRedeem: number;
  voucherExpiryDays: number;
  holdDays: number;
  carryOver: boolean;
  maxDiscountPercentOfOrder: number;
  countDeliveryAndCodFees: boolean;
  includedProducts: string[];
  maxActiveLoyaltyVouchersPerCustomer: number;
  onReturnAfterIssue: "flag_only" | "revoke_if_unused";
  autoLinkByPhone: boolean;
  programStartDate?: string;
  welcomeProgressAmount: number;
  version: number;
  updatedAt: string;
}

export interface IVoucherRedemption {
  _id: string;
  voucherId: string;
  code: string;
  orderType: "sale" | "preorder";
  orderId: string;
  orderNo: string;
  phone: string;
  userId?: string;
  discountAmount: number;
  eligibleSubtotal: number;
  status: "reserved" | "redeemed" | "released" | "reversed";
  createdAt: string;
}

export const loyaltyApi = {
  // Public
  async getPublicSettings(): Promise<IPublicLoyaltySettings> {
    const res = await fetch(`${BACKEND_URL}/api/public/loyalty`, {
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to load loyalty settings");
    return json.settings;
  },

  // Customer Account
  async getCustomerAccount(phone?: string, token?: string): Promise<{ account: ILoyaltyAccount | null; settings: IPublicLoyaltySettings }> {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-session-token"] = token;
    }
    const res = await fetch(`${BACKEND_URL}/api/account/loyalty${query}`, {
      headers,
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch loyalty account");
    return json;
  },

  async getCustomerVouchers(phone?: string, status?: string, token?: string): Promise<IVoucher[]> {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone);
    if (status) params.set("status", status);
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-session-token"] = token;
    }
    const res = await fetch(`${BACKEND_URL}/api/account/vouchers?${params.toString()}`, {
      headers,
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch vouchers");
    return json.vouchers || [];
  },

  async getCustomerLedger(phone?: string, token?: string): Promise<ILoyaltyLedgerEntry[]> {
    const query = phone ? `?phone=${encodeURIComponent(phone)}` : "";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-session-token"] = token;
    }
    const res = await fetch(`${BACKEND_URL}/api/account/loyalty/history${query}`, {
      headers,
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch ledger");
    return json.entries || [];
  },

  async validateVoucher(payload: {
    code: string;
    items: {
      productId: string;
      productName: string;
      price: number;
      quantity: number;
      productCode?: string;
    }[];
    phone?: string;
  }): Promise<IVoucherEvaluationResult> {
    const res = await fetch(`${BACKEND_URL}/api/vouchers/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Voucher validation failed");
    return json.evaluation;
  },

  // Admin APIs
  async getAdminOverview(): Promise<ILoyaltyOverviewMetrics> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/overview`, {
      headers: getAdminHeaders(),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch overview metrics");
    return json.metrics;
  },

  async getAdminVouchers(params?: {
    search?: string;
    status?: string;
    source?: string;
    page?: number;
    limit?: number;
  }): Promise<{ vouchers: IVoucher[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.source) qs.set("source", params.source);
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.limit) qs.set("limit", params.limit.toString());

    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/vouchers?${qs.toString()}`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch vouchers");
    return {
      vouchers: json.vouchers || [],
      total: json.pagination?.total || json.total || 0,
    };
  },

  async createVoucher(payload: any): Promise<IVoucher> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/vouchers`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create voucher");
    return json.voucher;
  },

  async bulkGenerateVouchers(payload: any): Promise<{ count: number; codes: string[] }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/vouchers/bulk`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to bulk generate vouchers");
    return json;
  },

  async updateVoucher(
    id: string,
    payload: { status?: string; note?: string; expiresAt?: string; usageLimitTotal?: number }
  ): Promise<IVoucher> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/vouchers/${id}`, {
      method: "PATCH",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update voucher");
    return json.voucher;
  },

  async voidVoucher(id: string, voidReason: string): Promise<IVoucher> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/vouchers/${id}/void`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ voidReason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to void voucher");
    return json.voucher;
  },

  async getAdminSettings(): Promise<ILoyaltySettingsDoc> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/settings`, {
      headers: getAdminHeaders(),
      cache: "no-store",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch settings");
    return json.settings;
  },

  async updateAdminSettings(payload: Partial<ILoyaltySettingsDoc>): Promise<ILoyaltySettingsDoc> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/settings`, {
      method: "PUT",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update settings");
    return json.settings;
  },

  async getAdminAccounts(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ accounts: ILoyaltyAccount[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.limit) qs.set("limit", params.limit.toString());

    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/customers?${qs.toString()}`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch accounts");
    return {
      accounts: json.accounts || [],
      total: json.pagination?.total || json.total || 0,
    };
  },

  async manualAdjustment(payload: {
    phone: string;
    amount: number;
    reason: string;
  }): Promise<{ account: ILoyaltyAccount; newBalance: number }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/adjust`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to apply manual adjustment");
    return json;
  },

  async rebuildAccount(phone: string): Promise<ILoyaltyAccount> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/accounts/${encodeURIComponent(phone)}/rebuild`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to rebuild account");
    return json.account;
  },

  async importPurchases(rows: { phone: string; amount: number; orderRef?: string; date?: string }[]): Promise<any> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/import`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ rows }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to import past purchases");
    return json;
  },

  async getRedemptions(params?: {
    voucherId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ redemptions: IVoucherRedemption[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.voucherId) qs.set("voucherId", params.voucherId);
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.limit) qs.set("limit", params.limit.toString());

    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/redemptions?${qs.toString()}`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch redemptions");
    return {
      redemptions: json.redemptions || [],
      total: json.pagination?.total || json.total || 0,
    };
  },

  async getReviewQueue(): Promise<{ vouchers: IVoucher[] }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/review-queue`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch review queue");
    const vouchers = json.vouchers || json.queue?.vouchers || [];
    return { vouchers };
  },

  async resolveReviewVoucher(id: string, action: "approve" | "void", voidReason?: string): Promise<void> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/review-queue/${id}/resolve`, {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ action, voidReason }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to resolve review voucher");
  },

  async getAuditLogs(params?: {
    entityType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ logs: any[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.entityType) qs.set("entityType", params.entityType);
    if (params?.search) qs.set("search", params.search);
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.limit) qs.set("limit", params.limit.toString());

    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/audit?${qs.toString()}`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch audit logs");
    return {
      logs: json.logs || [],
      total: json.pagination?.total || json.total || 0,
    };
  },

  async getCustomerDetail(idOrPhone: string): Promise<{
    account: ILoyaltyAccount;
    ledger: any[];
    vouchers: IVoucher[];
  }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/customers/${encodeURIComponent(idOrPhone)}`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch customer details");
    return {
      account: json.account,
      ledger: Array.isArray(json.ledger) ? json.ledger : [],
      vouchers: Array.isArray(json.vouchers) ? json.vouchers : [],
    };
  },

  async backfillDeliveredSales(): Promise<{
    processedSales: number;
    newlyEarnedTaka: number;
    vouchersIssued: number;
  }> {
    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/backfill`, {
      method: "POST",
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to backfill sales");
    return json;
  },

  async getNotificationQueue(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{ notifications: any[]; total: number }> {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", params.page.toString());
    if (params?.limit) qs.set("limit", params.limit.toString());

    const res = await fetch(`${BACKEND_URL}/api/admin/loyalty/notifications?${qs.toString()}`, {
      headers: getAdminHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch notifications");
    return {
      notifications: Array.isArray(json.notifications) ? json.notifications : [],
      total: json.pagination?.total || json.total || 0,
    };
  },

  async linkPastAccount(phone: string): Promise<{ account: ILoyaltyAccount }> {
    const res = await fetch(`${BACKEND_URL}/api/account/loyalty/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ phone }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to link past purchases");
    return json;
  },
};

