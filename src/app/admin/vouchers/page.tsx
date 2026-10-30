"use client";

import React, { useState, useEffect } from "react";
import { formatTaka, formatAdminDate } from "@/config/admin-labels";
import {
  loyaltyApi,
  IVoucher,
  ILoyaltySettingsDoc,
  ILoyaltyAccount,
  ILoyaltyOverviewMetrics,
  IVoucherRedemption,
} from "@/lib/loyalty-api";
import { notify } from "@/lib/notify";
import {
  FaGift,
  FaTicketAlt,
  FaCog,
  FaUsers,
  FaHistory,
  FaExclamationTriangle,
  FaFileImport,
  FaPlus,
  FaTrash,
  FaPause,
  FaPlay,
  FaCopy,
  FaCheck,
  FaSearch,
  FaSpinner,
  FaCalculator,
  FaShieldAlt,
  FaCoins,
  FaArrowRight,
  FaFilter,
  FaDownload,
  FaTimes,
  FaSyncAlt,
  FaUserCheck,
} from "react-icons/fa";

type ActiveTab =
  | "overview"
  | "vouchers"
  | "create"
  | "settings"
  | "customers"
  | "redemptions"
  | "review"
  | "audit";

export default function AdminVouchersPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState<ILoyaltyOverviewMetrics | null>(null);
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [settings, setSettings] = useState<ILoyaltySettingsDoc | null>(null);
  const [accounts, setAccounts] = useState<ILoyaltyAccount[]>([]);
  const [redemptions, setRedemptions] = useState<IVoucherRedemption[]>([]);
  const [reviewVouchers, setReviewVouchers] = useState<IVoucher[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Search & filter states
  const [voucherSearch, setVoucherSearch] = useState("");
  const [voucherStatusFilter, setVoucherStatusFilter] = useState("all");
  const [accountSearch, setAccountSearch] = useState("");

  // Modals & form states
  const [isVoidModalOpen, setIsVoidModalOpen] = useState(false);
  const [targetVoucherId, setTargetVoucherId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [isSubmittingVoid, setIsSubmittingVoid] = useState(false);

  // Manual Adjust Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustPhone, setAdjustPhone] = useState("");
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Create Voucher Form
  const [createForm, setCreateForm] = useState({
    code: "",
    source: "custom",
    discountType: "fixed",
    value: 200,
    maxDiscountAmount: 500,
    minOrderAmount: 1500,
    expiryDays: 90,
    usageLimitTotal: 100,
    usageLimitPerCustomer: 1,
    assignedPhone: "",
    ignoreCap: false,
    note: "",
  });

  // Bulk generator form
  const [bulkForm, setBulkForm] = useState({
    prefix: "HB",
    count: 20,
    discountType: "fixed",
    value: 100,
    minOrderAmount: 1000,
    expiryDays: 60,
    note: "Bulk seasonal campaign",
  });
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  // Customer Detail Drawer state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetail, setCustomerDetail] = useState<{
    account: ILoyaltyAccount;
    ledger: any[];
    vouchers: IVoucher[];
  } | null>(null);
  const [isLoadingCustomerDetail, setIsLoadingCustomerDetail] = useState(false);

  // Backfill state
  const [isBackfilling, setIsBackfilling] = useState(false);

  // Simulator test order amount
  const [simOrderAmount, setSimOrderAmount] = useState(2500);

  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [mRes, vRes, sRes, aRes, rRes, revRes, logRes] = await Promise.allSettled([
        loyaltyApi.getAdminOverview(),
        loyaltyApi.getAdminVouchers({ limit: 100 }),
        loyaltyApi.getAdminSettings(),
        loyaltyApi.getAdminAccounts({ limit: 100 }),
        loyaltyApi.getRedemptions({ limit: 100 }),
        loyaltyApi.getReviewQueue(),
        loyaltyApi.getAuditLogs({ limit: 100 }),
      ]);

      if (mRes.status === "fulfilled" && mRes.value) setMetrics(mRes.value);
      if (vRes.status === "fulfilled" && vRes.value) {
        setVouchers(Array.isArray(vRes.value.vouchers) ? vRes.value.vouchers : []);
      }
      if (sRes.status === "fulfilled" && sRes.value) setSettings(sRes.value);
      if (aRes.status === "fulfilled" && aRes.value) {
        setAccounts(Array.isArray(aRes.value.accounts) ? aRes.value.accounts : []);
      }
      if (rRes.status === "fulfilled" && rRes.value) {
        setRedemptions(Array.isArray(rRes.value.redemptions) ? rRes.value.redemptions : []);
      }
      if (revRes.status === "fulfilled" && revRes.value) {
        setReviewVouchers(Array.isArray(revRes.value.vouchers) ? revRes.value.vouchers : []);
      }
      if (logRes.status === "fulfilled" && logRes.value) {
        setAuditLogs(Array.isArray(logRes.value.logs) ? logRes.value.logs : []);
      }
    } catch (err: any) {
      notify.error(err.message || "Failed to load loyalty data");
    } finally {
      setIsLoading(false);
    }
  }

  // Handle Pause / Resume Voucher
  const handleToggleVoucherStatus = async (voucher: IVoucher) => {
    const newStatus = voucher.status === "active" ? "paused" : "active";
    try {
      await loyaltyApi.updateVoucher(voucher._id, { status: newStatus });
      notify.success(`Voucher ${voucher.code} is now ${newStatus}`);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to update voucher status");
    }
  };

  // Open Void Modal
  const openVoidModal = (voucherId: string) => {
    setTargetVoucherId(voucherId);
    setVoidReason("");
    setIsVoidModalOpen(true);
  };

  // Confirm Void Voucher
  const handleConfirmVoid = async () => {
    if (!targetVoucherId || !voidReason.trim()) {
      notify.error("A clear reason is required to void a voucher");
      return;
    }
    setIsSubmittingVoid(true);
    try {
      await loyaltyApi.voidVoucher(targetVoucherId, voidReason.trim());
      notify.success("Voucher successfully voided");
      setIsVoidModalOpen(false);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to void voucher");
    } finally {
      setIsSubmittingVoid(false);
    }
  };

  // Handle Create Single Voucher
  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + Number(createForm.expiryDays));

      await loyaltyApi.createVoucher({
        code: createForm.code ? createForm.code.trim().toUpperCase() : undefined,
        source: createForm.source,
        discountType: createForm.discountType,
        value: Number(createForm.value),
        maxDiscountAmount:
          createForm.discountType === "percent" ? Number(createForm.maxDiscountAmount) : undefined,
        minOrderAmount: Number(createForm.minOrderAmount),
        startsAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        usageLimitTotal: createForm.usageLimitTotal ? Number(createForm.usageLimitTotal) : null,
        usageLimitPerCustomer: Number(createForm.usageLimitPerCustomer),
        assignedPhone: createForm.assignedPhone.trim() || null,
        ignoreCap: createForm.ignoreCap,
        note: createForm.note.trim() || undefined,
      });

      notify.success("Voucher successfully created");
      setCreateForm({
        code: "",
        source: "custom",
        discountType: "fixed",
        value: 200,
        maxDiscountAmount: 500,
        minOrderAmount: 1500,
        expiryDays: 90,
        usageLimitTotal: 100,
        usageLimitPerCustomer: 1,
        assignedPhone: "",
        ignoreCap: false,
        note: "",
      });
      loadAllData();
      setActiveTab("vouchers");
    } catch (err: any) {
      notify.error(err.message || "Failed to create voucher");
    }
  };

  // Handle Bulk Generate Vouchers
  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loyaltyApi.bulkGenerateVouchers({
        prefix: bulkForm.prefix || "HB",
        count: Number(bulkForm.count),
        discountType: bulkForm.discountType,
        value: Number(bulkForm.value),
        minOrderAmount: Number(bulkForm.minOrderAmount),
        expiryDays: Number(bulkForm.expiryDays),
        note: bulkForm.note,
      });

      setGeneratedCodes(res.codes);
      notify.success(`Successfully generated ${res.count} unique vouchers`);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to generate bulk vouchers");
    }
  };

  // Handle Open Customer Detail Drawer
  const handleOpenCustomerDetail = async (idOrPhone: string) => {
    setSelectedCustomerId(idOrPhone);
    setIsLoadingCustomerDetail(true);
    try {
      const data = await loyaltyApi.getCustomerDetail(idOrPhone);
      setCustomerDetail(data);
    } catch (err: any) {
      notify.error(err.message || "Failed to load customer details");
      setSelectedCustomerId(null);
    } finally {
      setIsLoadingCustomerDetail(false);
    }
  };

  // Handle Run Retroactive Sales Backfill
  const handleRunBackfill = async () => {
    if (typeof window !== "undefined") {
      const ok = window.confirm("Run retroactive sales backfill? This will scan past delivered sales since the program start date and award missing loyalty progress.");
      if (!ok) return;
    }
    setIsBackfilling(true);
    try {
      const res = await loyaltyApi.backfillDeliveredSales();
      notify.success(`Backfill complete: ${res.processedSales} sales processed, ৳${res.newlyEarnedTaka} progress awarded, ${res.vouchersIssued} vouchers issued`);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to run backfill");
    } finally {
      setIsBackfilling(false);
    }
  };

  // Handle Download Bulk Voucher Codes CSV
  const handleDownloadBulkCsv = () => {
    if (generatedCodes.length === 0) return;
    const header = "code,discountType,value,minOrderAmount,note\n";
    const rows = generatedCodes
      .map(
        (code) =>
          `"${code}","${bulkForm.discountType}",${bulkForm.value},${bulkForm.minOrderAmount},"${bulkForm.note}"`
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hatkhola-bulk-vouchers-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify.success("Bulk vouchers CSV downloaded");
  };

  // Handle Settings Update
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await loyaltyApi.updateAdminSettings(settings);
      setSettings(updated);
      notify.success("Loyalty settings updated successfully");
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to update settings");
    }
  };

  // Handle Manual Customer Adjustment
  const handleManualAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPhone || adjustAmount === 0 || !adjustReason.trim()) {
      notify.error("Phone, non-zero amount, and audit reason are required");
      return;
    }
    setIsSubmittingAdjust(true);
    try {
      await loyaltyApi.manualAdjustment({
        phone: adjustPhone,
        amount: Number(adjustAmount),
        reason: adjustReason.trim(),
      });
      notify.success(`Adjusted balance for ${adjustPhone} by ${formatTaka(adjustAmount)}`);
      setIsAdjustModalOpen(false);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Adjustment failed");
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  // Handle Rebuild Customer Account
  const handleRebuildAccount = async (phone: string) => {
    try {
      await loyaltyApi.rebuildAccount(phone);
      notify.success(`Account for ${phone} rebuilt from ledger`);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to rebuild account");
    }
  };

  // Handle CSV Import
  const handleImportPastPurchases = async () => {
    if (!csvText.trim()) {
      notify.error("Please paste CSV data");
      return;
    }

    const lines = csvText.trim().split("\n");
    const rows: any[] = [];
    for (const line of lines) {
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        const phone = parts[0];
        const amount = parseInt(parts[1], 10);
        if (phone && !isNaN(amount)) {
          rows.push({
            phone,
            amount,
            orderRef: parts[2] || undefined,
            date: parts[3] || undefined,
          });
        }
      }
    }

    if (rows.length === 0) {
      notify.error("No valid rows found. Format: phone,amount,orderRef,date");
      return;
    }

    setIsImporting(true);
    try {
      const res = await loyaltyApi.importPurchases(rows);
      notify.success(`Import complete: ${res.successfulCount} imported, ${res.skippedCount} skipped`);
      setIsImportModalOpen(false);
      setCsvText("");
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Failed to import purchases");
    } finally {
      setIsImporting(false);
    }
  };

  // Review Queue Action
  const handleResolveReview = async (id: string, action: "approve" | "void") => {
    try {
      await loyaltyApi.resolveReviewVoucher(id, action, action === "void" ? "Voided via review queue" : undefined);
      notify.success(`Voucher ${action === "approve" ? "approved" : "voided"}`);
      loadAllData();
    } catch (err: any) {
      notify.error(err.message || "Resolution failed");
    }
  };

  // Filter vouchers
  const filteredVouchers = (Array.isArray(vouchers) ? vouchers : []).filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(voucherSearch.toLowerCase()) ||
      (v.assignedPhone && v.assignedPhone.includes(voucherSearch));
    const matchesStatus = voucherStatusFilter === "all" || v.status === voucherStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter accounts
  const filteredAccounts = (Array.isArray(accounts) ? accounts : []).filter((a) => {
    return (
      (a.phone && a.phone.includes(accountSearch)) ||
      (a.name && a.name.toLowerCase().includes(accountSearch.toLowerCase()))
    );
  });

  const voucherCount = Array.isArray(vouchers) ? vouchers.length : 0;
  const accountCount = Array.isArray(accounts) ? accounts.length : 0;
  const redemptionCount = Array.isArray(redemptions) ? redemptions.length : 0;
  const reviewCount = Array.isArray(reviewVouchers) ? reviewVouchers.length : 0;
  const auditCount = Array.isArray(auditLogs) ? auditLogs.length : 0;

  return (
    <div className="flex-1 flex flex-col min-w-0 pb-16">
      {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-primary shadow-2xs">
              <FaGift className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Vouchers & Loyalty Program (ভাউচার ও লয়ালটি)
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Manage rewards progress, vouchers issuance, redemptions, settings, and accounting.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAllData()}
              className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              Refresh
            </button>
          </div>
        </header>

        {/* 8-Tab Navigation Bar */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-6 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2 min-w-max py-2">
            {[
              { id: "overview", label: "Overview", icon: FaCoins },
              { id: "vouchers", label: `Vouchers (${voucherCount})`, icon: FaTicketAlt },
              { id: "create", label: "Create Voucher", icon: FaPlus },
              { id: "settings", label: "Loyalty Settings", icon: FaCog },
              { id: "customers", label: `Customers (${accountCount})`, icon: FaUsers },
              { id: "redemptions", label: `Redemptions (${redemptionCount})`, icon: FaHistory },
              {
                id: "review",
                label: `Review Queue (${reviewCount})`,
                icon: FaExclamationTriangle,
                badge: reviewCount > 0,
              },
              { id: "audit", label: `Audit Log (${auditCount})`, icon: FaShieldAlt },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-6 max-w-7xl w-full mx-auto space-y-4 sm:space-y-6">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <FaSpinner className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading loyalty system...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && metrics && (
                <div className="space-y-4 sm:space-y-6">
                  {/* Metric Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Total Loyalty Accounts
                      </p>
                      <p className="text-2xl font-mono font-black text-slate-900">
                        {metrics.totalLoyaltyAccounts}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Active Vouchers
                      </p>
                      <p className="text-2xl font-mono font-black text-emerald-700">
                        {metrics.activeLoyaltyVouchers}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Total Discounts Given
                      </p>
                      <p className="text-2xl font-mono font-black text-slate-900">
                        {formatTaka(metrics.totalDiscountGivenTaka)}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Outstanding Voucher Liability
                      </p>
                      <p className="text-2xl font-mono font-black text-amber-700">
                        {formatTaka(metrics.outstandingVoucherLiabilityTaka)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Vouchers Issued
                      </p>
                      <p className="text-xl font-mono font-bold text-slate-800">
                        {metrics.totalVouchersIssued}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Vouchers Redeemed
                      </p>
                      <p className="text-xl font-mono font-bold text-blue-700">
                        {metrics.totalVouchersRedeemed}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Expired Unused
                      </p>
                      <p className="text-xl font-mono font-bold text-slate-500">
                        {metrics.expiredUnusedCount}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-1">
                      <p className="text-3xs font-bold text-slate-400 uppercase tracking-wider">
                        Review Queue Flagged
                      </p>
                      <p className={`text-xl font-mono font-bold ${metrics.vouchersInReviewCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
                        {metrics.vouchersInReviewCount}
                      </p>
                    </div>
                  </div>

                  {/* Summary Banner */}
                  <div className="p-6 rounded-2xl bg-linear-to-r from-orange-50 to-amber-50 border border-orange-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">
                        Loyalty Program Status: {settings?.loyaltyEnabled ? "Active & Earning" : "Paused"}
                      </h3>
                      <p className="text-xs text-slate-600">
                        Delivered target: {formatTaka(settings?.targetAmount || 4000)} | Reward: {formatTaka(settings?.rewardAmount || 250)} | Hold period: {settings?.holdDays || 3} days.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("settings")}
                      className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-2xs cursor-pointer whitespace-nowrap"
                    >
                      Configure Program
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: VOUCHERS LIST */}
              {activeTab === "vouchers" && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="relative w-full sm:w-72">
                      <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                      <input
                        type="text"
                        value={voucherSearch}
                        onChange={(e) => setVoucherSearch(e.target.value)}
                        placeholder="Search code or phone..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <select
                        value={voucherStatusFilter}
                        onChange={(e) => setVoucherStatusFilter(e.target.value)}
                        className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                      >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="redeemed">Redeemed</option>
                        <option value="expired">Expired</option>
                        <option value="voided">Voided</option>
                        <option value="review">Review</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setActiveTab("create")}
                        className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <FaPlus className="w-3 h-3" />
                        <span>New Voucher</span>
                      </button>
                    </div>
                  </div>

                  {/* Vouchers Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Code</th>
                            <th className="py-3 px-4">Source</th>
                            <th className="py-3 px-4">Discount</th>
                            <th className="py-3 px-4">Min Order</th>
                            <th className="py-3 px-4">Expiry</th>
                            <th className="py-3 px-4">Usage</th>
                            <th className="py-3 px-4">Assigned To</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {filteredVouchers.length > 0 ? (
                            filteredVouchers.map((v) => (
                              <tr key={v._id} className="hover:bg-slate-50/80">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                  {v.code}
                                </td>
                                <td className="py-3 px-4 capitalize">
                                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                    {v.source}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                                  {v.discountType === "fixed" ? formatTaka(v.value) : `${v.value}%`}
                                </td>
                                <td className="py-3 px-4 font-mono">
                                  {formatTaka(v.minOrderAmount)}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-500">
                                  {formatAdminDate(v.expiresAt)}
                                </td>
                                <td className="py-3 px-4 font-mono">
                                  {v.usedCount} / {v.usageLimitTotal ?? "unlimited"}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-600">
                                  {v.assignedPhone || "Anyone"}
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                                      v.status === "active"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : v.status === "paused"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : v.status === "redeemed"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : v.status === "review"
                                        ? "bg-purple-50 text-purple-700 border-purple-200"
                                        : "bg-slate-100 text-slate-600 border-slate-200"
                                    }`}
                                  >
                                    {v.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right space-x-1">
                                  {v.status === "active" && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVoucherStatus(v)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 cursor-pointer"
                                      title="Pause voucher"
                                    >
                                      <FaPause className="w-3 h-3" />
                                    </button>
                                  )}
                                  {v.status === "paused" && (
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVoucherStatus(v)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                                      title="Resume voucher"
                                    >
                                      <FaPlay className="w-3 h-3" />
                                    </button>
                                  )}
                                  {v.status !== "voided" && v.status !== "redeemed" && (
                                    <button
                                      type="button"
                                      onClick={() => openVoidModal(v._id)}
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      title="Void voucher"
                                    >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="py-8 text-center text-slate-400">
                                No vouchers matching the filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CREATE VOUCHER & BULK GENERATE */}
              {activeTab === "create" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Form Left Column (7 cols) */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FaTicketAlt className="text-primary w-4 h-4" />
                        <span>Create Single Voucher</span>
                      </h2>
                    </div>

                    <form onSubmit={handleCreateVoucher} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Voucher Code (Optional: leave blank to auto-generate HB-XXXX-XXXX)
                        </label>
                        <input
                          type="text"
                          value={createForm.code}
                          onChange={(e) =>
                            setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })
                          }
                          placeholder="e.g. HB-WINTER-2026"
                          className="w-full px-3.5 py-2 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Discount Type
                          </label>
                          <select
                            value={createForm.discountType}
                            onChange={(e) =>
                              setCreateForm({ ...createForm, discountType: e.target.value })
                            }
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                          >
                            <option value="fixed">Fixed Taka (৳)</option>
                            <option value="percent">Percentage (%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Discount Value ({createForm.discountType === "fixed" ? "৳" : "%"})
                          </label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={createForm.value}
                            onChange={(e) =>
                              setCreateForm({ ...createForm, value: parseInt(e.target.value, 10) || 0 })
                            }
                            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Min Order Amount (৳)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={createForm.minOrderAmount}
                            onChange={(e) =>
                              setCreateForm({
                                ...createForm,
                                minOrderAmount: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Valid For (Days)
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={createForm.expiryDays}
                            onChange={(e) =>
                              setCreateForm({
                                ...createForm,
                                expiryDays: parseInt(e.target.value, 10) || 30,
                              })
                            }
                            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Usage Limit Total (0 for unlimited)
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={createForm.usageLimitTotal}
                            onChange={(e) =>
                              setCreateForm({
                                ...createForm,
                                usageLimitTotal: parseInt(e.target.value, 10) || 0,
                              })
                            }
                            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Assigned Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            value={createForm.assignedPhone}
                            onChange={(e) =>
                              setCreateForm({ ...createForm, assignedPhone: e.target.value })
                            }
                            placeholder="e.g. 01XXXXXXXXX"
                            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          id="ignoreCap"
                          checked={createForm.ignoreCap}
                          onChange={(e) =>
                            setCreateForm({ ...createForm, ignoreCap: e.target.checked })
                          }
                          className="rounded border-slate-300 text-primary"
                        />
                        <label htmlFor="ignoreCap" className="text-xs text-slate-700 font-semibold cursor-pointer">
                          Ignore 15% Order Cap (Audited override for compensation vouchers)
                        </label>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Internal Note
                        </label>
                        <input
                          type="text"
                          value={createForm.note}
                          onChange={(e) => setCreateForm({ ...createForm, note: e.target.value })}
                          placeholder="Purpose of voucher"
                          className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        Create Voucher
                      </button>
                    </form>
                  </div>

                  {/* Simulator & Bulk Column (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Live Simulator Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <FaCalculator className="text-primary w-4 h-4" />
                        <h3 className="text-sm font-bold text-slate-900">Live Discount Simulator</h3>
                      </div>

                      <div>
                        <label className="block text-3xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Test Order Subtotal (৳)
                        </label>
                        <input
                          type="number"
                          value={simOrderAmount}
                          onChange={(e) => setSimOrderAmount(parseInt(e.target.value, 10) || 0)}
                          className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-2 text-xs">
                        {(() => {
                          const meetsMin = simOrderAmount >= createForm.minOrderAmount;
                          let calcDiscount = 0;
                          if (meetsMin) {
                            if (createForm.discountType === "fixed") {
                              calcDiscount = Math.min(simOrderAmount, createForm.value);
                            } else {
                              const raw = Math.round((simOrderAmount * createForm.value) / 100);
                              calcDiscount = Math.min(raw, createForm.maxDiscountAmount || raw);
                            }
                            if (!createForm.ignoreCap) {
                              const cap = Math.round((simOrderAmount * 15) / 100);
                              calcDiscount = Math.min(calcDiscount, cap);
                            }
                          }

                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Eligible:</span>
                                <span className="font-bold">{meetsMin ? "Yes" : "No (Below Min Order)"}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-600">Calculated Discount:</span>
                                <span className="font-mono font-bold text-emerald-700">
                                  {formatTaka(calcDiscount)}
                                </span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-orange-200 text-slate-900 font-bold">
                                <span>Customer Pays:</span>
                                <span className="font-mono">{formatTaka(Math.max(0, simOrderAmount - calcDiscount))}</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Bulk Generate Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                        <FaFileImport className="text-primary w-4 h-4" />
                        <h3 className="text-sm font-bold text-slate-900">Bulk Code Generator</h3>
                      </div>

                      <form onSubmit={handleBulkGenerate} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-3xs font-bold text-slate-500 uppercase mb-1">
                              Prefix
                            </label>
                            <input
                              type="text"
                              value={bulkForm.prefix}
                              onChange={(e) => setBulkForm({ ...bulkForm, prefix: e.target.value.toUpperCase() })}
                              className="w-full px-3 py-1.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-3xs font-bold text-slate-500 uppercase mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={bulkForm.count}
                              onChange={(e) => setBulkForm({ ...bulkForm, count: parseInt(e.target.value, 10) || 10 })}
                              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-3xs font-bold text-slate-500 uppercase mb-1">
                              Value (৳)
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={bulkForm.value}
                              onChange={(e) => setBulkForm({ ...bulkForm, value: parseInt(e.target.value, 10) || 50 })}
                              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                            />
                          </div>

                          <div>
                            <label className="block text-3xs font-bold text-slate-500 uppercase mb-1">
                              Min Order (৳)
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={bulkForm.minOrderAmount}
                              onChange={(e) => setBulkForm({ ...bulkForm, minOrderAmount: parseInt(e.target.value, 10) || 0 })}
                              className="w-full px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
                        >
                          Generate {bulkForm.count} Codes
                        </button>
                      </form>

                      {generatedCodes.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between">
                            <p className="text-3xs font-bold text-slate-500 uppercase">
                              Generated Codes ({generatedCodes.length}):
                            </p>
                            <button
                              type="button"
                              onClick={handleDownloadBulkCsv}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                            >
                              <FaDownload className="w-3 h-3" />
                              <span>Download CSV</span>
                            </button>
                          </div>
                          <textarea
                            readOnly
                            rows={4}
                            value={generatedCodes.join("\n")}
                            className="w-full p-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LOYALTY SETTINGS */}
              {activeTab === "settings" && settings && (
                <div className="max-w-2xl bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <FaCog className="text-primary w-4 h-4" />
                        <span>Loyalty Program Parameters (Version {settings.version})</span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Changes affect only future earning. All existing vouchers retain their issued snapshot.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Loyalty Program Enabled</p>
                        <p className="text-[11px] text-slate-500">Allow customers to earn and track progress</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.loyaltyEnabled}
                        onChange={(e) => setSettings({ ...settings, loyaltyEnabled: e.target.checked })}
                        className="rounded border-slate-300 text-primary w-4 h-4"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Target Spend Amount (৳)
                        </label>
                        <input
                          type="number"
                          required
                          min={500}
                          value={settings.targetAmount}
                          onChange={(e) =>
                            setSettings({ ...settings, targetAmount: parseInt(e.target.value, 10) || 4000 })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Reward Voucher Value (৳)
                        </label>
                        <input
                          type="number"
                          required
                          min={50}
                          value={settings.rewardAmount}
                          onChange={(e) =>
                            setSettings({ ...settings, rewardAmount: parseInt(e.target.value, 10) || 250 })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Min Order to Redeem (৳)
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={settings.minOrderToRedeem}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              minOrderToRedeem: parseInt(e.target.value, 10) || 2000,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Voucher Expiry (Days)
                        </label>
                        <input
                          type="number"
                          required
                          min={7}
                          value={settings.voucherExpiryDays}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              voucherExpiryDays: parseInt(e.target.value, 10) || 90,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Hold Days (Delivery to Eligibility)
                        </label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={settings.holdDays}
                          onChange={(e) =>
                            setSettings({ ...settings, holdDays: parseInt(e.target.value, 10) || 3 })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Max Active Vouchers Per Customer
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          value={settings.maxActiveLoyaltyVouchersPerCustomer}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              maxActiveLoyaltyVouchersPerCustomer: parseInt(e.target.value, 10) || 3,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Max Discount % of Order Subtotal
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          value={settings.maxDiscountPercentOfOrder}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              maxDiscountPercentOfOrder: parseInt(e.target.value, 10) || 15,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Action on Return After Issue
                        </label>
                        <select
                          value={settings.onReturnAfterIssue}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              onReturnAfterIssue: e.target.value as any,
                            })
                          }
                          className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                        >
                          <option value="flag_only">Flag only (Admin review queue)</option>
                          <option value="revoke_if_unused">Revoke automatically if unused</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Program Start Date
                        </label>
                        <input
                          type="date"
                          value={settings.programStartDate ? settings.programStartDate.slice(0, 10) : ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              programStartDate: e.target.value || undefined,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Orders before this date do not count toward progress.</p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Welcome Progress Amount (৳)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={settings.welcomeProgressAmount || 0}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              welcomeProgressAmount: parseInt(e.target.value, 10) || 0,
                            })
                          }
                          className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">Optional starting spend credited to new customer accounts.</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Included Products (Product Codes)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. GHEE, GUR (leave empty for all products)"
                        value={Array.isArray(settings.includedProducts) ? settings.includedProducts.join(", ") : ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            includedProducts: e.target.value
                              .split(",")
                              .map((p) => p.trim().toUpperCase())
                              .filter(Boolean),
                          })
                        }
                        className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Comma-separated list of product codes that earn progress.</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="countDeliveryAndCodFees"
                          checked={settings.countDeliveryAndCodFees || false}
                          onChange={(e) => setSettings({ ...settings, countDeliveryAndCodFees: e.target.checked })}
                          className="rounded border-slate-300 text-primary"
                        />
                        <label htmlFor="countDeliveryAndCodFees" className="text-xs text-slate-700 font-semibold cursor-pointer">
                          Count Delivery and COD Fees toward progress (defaults to false)
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="autoLinkByPhone"
                          checked={settings.autoLinkByPhone || false}
                          onChange={(e) => setSettings({ ...settings, autoLinkByPhone: e.target.checked })}
                          className="rounded border-slate-300 text-primary"
                        />
                        <label htmlFor="autoLinkByPhone" className="text-xs text-slate-700 font-semibold cursor-pointer">
                          Automatically link past purchases by phone on user login / checkout
                        </label>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="carryOver"
                          checked={settings.carryOver}
                          onChange={(e) => setSettings({ ...settings, carryOver: e.target.checked })}
                          className="rounded border-slate-300 text-primary"
                        />
                        <label htmlFor="carryOver" className="text-xs text-slate-700 font-semibold cursor-pointer">
                          Carry Over Extra Spend (Zero-Lost-Taka rule)
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Save Settings & Record Audit Log
                    </button>
                  </form>

                  {/* Historical Backfill Section */}
                  <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FaSyncAlt className="text-primary w-3.5 h-3.5" />
                        <span>Retroactive Delivered Sales Backfill</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Scans all past delivered sales and pre-orders since the program start date and retroactively awards progress to customer ledgers for any order not yet credited.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRunBackfill}
                      disabled={isBackfilling}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isBackfilling ? (
                        <>
                          <FaSpinner className="w-3.5 h-3.5 animate-spin text-orange-400" />
                          <span>Processing Backfill...</span>
                        </>
                      ) : (
                        <>
                          <FaSyncAlt className="w-3.5 h-3.5" />
                          <span>Run Retroactive Sales Backfill</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 5: CUSTOMERS & PROGRESS */}
              {activeTab === "customers" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div className="relative w-full sm:w-72">
                      <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                      <input
                        type="text"
                        value={accountSearch}
                        onChange={(e) => setAccountSearch(e.target.value)}
                        placeholder="Search phone or name..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaFileImport className="w-3 h-3 text-slate-500" />
                        <span>Import CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustPhone("");
                          setAdjustAmount(0);
                          setAdjustReason("");
                          setIsAdjustModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <FaPlus className="w-3 h-3" />
                        <span>Manual Adjustment</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Accounts Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">Customer Phone</th>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Progress Balance</th>
                            <th className="py-3 px-4">Pending Hold</th>
                            <th className="py-3 px-4">Lifetime Spend</th>
                            <th className="py-3 px-4">Vouchers Issued</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((a) => (
                              <tr key={a._id} className="hover:bg-slate-50/80">
                                <td
                                  onClick={() => handleOpenCustomerDetail(a.phone)}
                                  className="py-3 px-4 font-mono font-bold text-slate-900 hover:text-primary cursor-pointer"
                                >
                                  {a.phone}
                                </td>
                                <td
                                  onClick={() => handleOpenCustomerDetail(a.phone)}
                                  className="py-3 px-4 hover:text-primary cursor-pointer"
                                >
                                  {a.name || "-"}
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-orange-700">
                                  {formatTaka(a.progressBalance)}
                                </td>
                                <td className="py-3 px-4 font-mono text-amber-700">
                                  {formatTaka(a.pendingAmount)}
                                </td>
                                <td className="py-3 px-4 font-mono text-emerald-700">
                                  {formatTaka(a.lifetimeEligibleSpend)}
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-800">
                                  {a.vouchersIssuedCount}
                                </td>
                                <td className="py-3 px-4 text-right space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenCustomerDetail(a.phone)}
                                    className="text-xs font-bold text-slate-700 hover:text-primary hover:underline cursor-pointer"
                                  >
                                    Details
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdjustPhone(a.phone);
                                      setAdjustAmount(0);
                                      setAdjustReason("");
                                      setIsAdjustModalOpen(true);
                                    }}
                                    className="text-xs font-bold text-primary hover:underline cursor-pointer"
                                  >
                                    Adjust
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRebuildAccount(a.phone)}
                                    className="text-xs font-bold text-slate-500 hover:text-slate-900 hover:underline cursor-pointer"
                                  >
                                    Rebuild
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                No customer accounts found.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: REDEMPTIONS */}
              {activeTab === "redemptions" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Date</th>
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Order No</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Customer Phone</th>
                          <th className="py-3 px-4 text-right">Discount</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                          <th className="py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {Array.isArray(redemptions) && redemptions.length > 0 ? (
                          redemptions.map((r) => (
                            <tr key={r._id} className="hover:bg-slate-50/80">
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {formatAdminDate(r.createdAt)}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {r.code}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-800">
                                {r.orderNo}
                              </td>
                              <td className="py-3 px-4 capitalize">{r.orderType}</td>
                              <td className="py-3 px-4 font-mono">{r.phone}</td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-700 text-right">
                                {formatTaka(r.discountAmount)}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-700 text-right">
                                {formatTaka(r.eligibleSubtotal)}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                                    r.status === "redeemed"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : r.status === "reserved"
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-slate-100 text-slate-600 border-slate-200"
                                  }`}
                                >
                                  {r.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              No redemption records found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 7: REVIEW QUEUE */}
              {activeTab === "review" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs space-y-4">
                  <div className="p-4 border-b border-slate-100">
                    <h2 className="text-sm font-bold text-slate-900">
                      Vouchers Flagged for Review
                    </h2>
                    <p className="text-xs text-slate-500">
                      These vouchers were issued from purchases that were later cancelled or returned. You can approve to keep active or void them.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Code</th>
                          <th className="py-3 px-4">Customer</th>
                          <th className="py-3 px-4">Value</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {Array.isArray(reviewVouchers) && reviewVouchers.length > 0 ? (
                          reviewVouchers.map((v) => (
                            <tr key={v._id}>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900">
                                {v.code}
                              </td>
                              <td className="py-3 px-4 font-mono">{v.assignedPhone || "-"}</td>
                              <td className="py-3 px-4 font-mono font-bold">{formatTaka(v.value)}</td>
                              <td className="py-3 px-4">
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold">
                                  Review Required
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleResolveReview(v._id, "approve")}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleResolveReview(v._id, "void")}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold cursor-pointer"
                                >
                                  Void
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              Review queue is clean! No vouchers require review.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 8: AUDIT LOG */}
              {activeTab === "audit" && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Admin</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Entity</th>
                          <th className="py-3 px-4">Old Value</th>
                          <th className="py-3 px-4">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {Array.isArray(auditLogs) && auditLogs.length > 0 ? (
                          auditLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-slate-50/80">
                              <td className="py-3 px-4 font-mono text-slate-500">
                                {formatAdminDate(log.createdAt)}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-800">
                                {log.performedBy}
                              </td>
                              <td className="py-3 px-4 font-semibold text-primary">
                                {log.action}
                              </td>
                              <td className="py-3 px-4 capitalize">{log.entityType}</td>
                              <td className="py-3 px-4 font-mono text-slate-500 max-w-xs truncate">
                                {JSON.stringify(log.oldValue) || "-"}
                              </td>
                              <td className="py-3 px-4 font-mono text-slate-800 max-w-xs truncate">
                                {JSON.stringify(log.newValue) || "-"}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400">
                              No audit logs recorded yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* MODAL 1: Void Voucher Modal */}
      {isVoidModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FaTrash className="text-rose-600 w-4 h-4" />
              <span>Void Voucher</span>
            </h3>
            <p className="text-xs text-slate-600">
              Voiding a voucher permanently deactivates it. Please provide an audited reason:
            </p>
            <textarea
              required
              rows={3}
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="e.g. Returned order, customer request, or duplicate issuance"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsVoidModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                disabled={isSubmittingVoid || !voidReason.trim()}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingVoid ? "Voiding..." : "Confirm Void"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Manual Adjustment Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FaCoins className="text-primary w-4 h-4" />
              <span>Manual Progress Adjustment</span>
            </h3>
            <form onSubmit={handleManualAdjustment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Customer Phone (01XXXXXXXXX)
                </label>
                <input
                  type="tel"
                  required
                  value={adjustPhone}
                  onChange={(e) => setAdjustPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount in Taka (+ for credit, - for debit)
                </label>
                <input
                  type="number"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. 500 or -200"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Audit Reason (Mandatory)
                </label>
                <textarea
                  required
                  rows={2}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Offline order compensation or manual review bonus"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdjust || adjustAmount === 0 || !adjustReason.trim()}
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingAdjust ? "Saving..." : "Apply Adjustment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FaFileImport className="text-primary w-4 h-4" />
              <span>Import Past Purchases (CSV)</span>
            </h3>
            <p className="text-xs text-slate-600">
              Paste CSV rows in the format: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">phone,amount,orderRef,date</code>
            </p>
            <textarea
              required
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="01711000000,4200,ORD-101,2026-09-15&#10;01819000000,2500,ORD-102,2026-09-20"
              className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportPastPurchases}
                disabled={isImporting || !csvText.trim()}
                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isImporting ? "Importing..." : "Process Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWER: Customer Detail & Ledger Timeline */}
      {selectedCustomerId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div
            onClick={() => setSelectedCustomerId(null)}
            className="absolute inset-0"
          />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl p-6 overflow-y-auto space-y-6 z-10 animate-slide-in-right">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center font-bold text-sm">
                  <FaUsers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-mono">
                    {selectedCustomerId}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {customerDetail?.account?.name ? `Customer: ${customerDetail.account.name}` : "Guest Phone Account"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            {isLoadingCustomerDetail ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400 space-y-3">
                <FaSpinner className="w-6 h-6 animate-spin text-primary" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading Customer Timeline...</p>
              </div>
            ) : customerDetail ? (
              <>
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-orange-50/60 border border-orange-200/80 rounded-xl">
                    <p className="text-3xs font-bold text-orange-600 uppercase tracking-wider">Progress</p>
                    <p className="text-base font-black text-orange-950 font-mono mt-0.5">
                      {formatTaka(customerDetail.account.progressBalance)}
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                    <p className="text-3xs font-bold text-amber-600 uppercase tracking-wider">Pending Hold</p>
                    <p className="text-base font-black text-amber-950 font-mono mt-0.5">
                      {formatTaka(customerDetail.account.pendingAmount)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-xl">
                    <p className="text-3xs font-bold text-emerald-600 uppercase tracking-wider">Lifetime Spend</p>
                    <p className="text-base font-black text-emerald-950 font-mono mt-0.5">
                      {formatTaka(customerDetail.account.lifetimeEligibleSpend)}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <p className="text-3xs font-bold text-slate-600 uppercase tracking-wider">Vouchers</p>
                    <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                      {customerDetail.account.vouchersIssuedCount}
                    </p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustPhone(customerDetail.account.phone);
                      setAdjustAmount(0);
                      setAdjustReason("");
                      setIsAdjustModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span>Manual Progress Adjustment</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleRebuildAccount(customerDetail.account.phone);
                      handleOpenCustomerDetail(customerDetail.account.phone);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FaSyncAlt className="w-3 h-3" />
                    <span>Rebuild From Ledger</span>
                  </button>
                </div>

                {/* Vouchers Section */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaTicketAlt className="w-3.5 h-3.5 text-primary" />
                    <span>Customer Vouchers ({customerDetail.vouchers.length})</span>
                  </h4>
                  {customerDetail.vouchers.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customerDetail.vouchers.map((v) => (
                        <div
                          key={v._id}
                          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-mono font-bold text-xs text-slate-900">{v.code}</p>
                            <p className="text-[11px] text-slate-500">
                              {formatTaka(v.value)} discount {v.minOrderAmount > 0 ? `(min order ৳${v.minOrderAmount})` : ""}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              v.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : v.status === "redeemed"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-3 text-center border border-dashed border-slate-200 rounded-xl">
                      No vouchers issued yet.
                    </p>
                  )}
                </div>

                {/* Ledger Timeline Section */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FaHistory className="w-3.5 h-3.5 text-primary" />
                    <span>Append-Only Ledger Timeline ({customerDetail.ledger.length})</span>
                  </h4>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto max-h-80">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200 sticky top-0">
                          <tr>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Type</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3">Reason / Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {customerDetail.ledger.length > 0 ? (
                            customerDetail.ledger.map((l) => (
                              <tr key={l._id} className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-mono text-[11px] text-slate-500">
                                  {formatAdminDate(l.createdAt)}
                                </td>
                                <td className="py-2 px-3">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                      l.type.startsWith("earn")
                                        ? "bg-emerald-100 text-emerald-800"
                                        : l.type === "voucher_issue"
                                        ? "bg-purple-100 text-purple-800"
                                        : l.type === "reversal"
                                        ? "bg-rose-100 text-rose-800"
                                        : "bg-slate-100 text-slate-800"
                                    }`}
                                  >
                                    {l.type}
                                  </span>
                                </td>
                                <td
                                  className={`py-2 px-3 font-mono font-bold text-right ${
                                    l.amount >= 0 ? "text-emerald-700" : "text-rose-700"
                                  }`}
                                >
                                  {l.amount >= 0 ? `+৳${l.amount}` : `-৳${Math.abs(l.amount)}`}
                                </td>
                                <td className="py-2 px-3 text-slate-600 max-w-xs truncate">
                                  {l.reason || l.orderNo || "-"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-slate-400">
                                No ledger events recorded.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

