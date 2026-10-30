"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatTaka, formatAdminDate } from "@/config/admin-labels";
import { loyaltyApi, ILoyaltyAccount, IPublicLoyaltySettings, IVoucher, ILoyaltyLedgerEntry } from "@/lib/loyalty-api";
import { ProgressBar } from "@/components/loyalty/ProgressBar";
import { LoyaltyProgress as LoyaltyProgressCard } from "@/components/loyalty/LoyaltyProgress";
import { notify } from "@/lib/notify";
import {
  FaGift,
  FaTicketAlt,
  FaBoxOpen,
  FaCopy,
  FaCheck,
  FaClock,
  FaHistory,
  FaArrowLeft,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

export default function CustomerAccountPage() {
  const [account, setAccount] = useState<ILoyaltyAccount | null>(null);
  const [settings, setSettings] = useState<IPublicLoyaltySettings | null>(null);
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [ledger, setLedger] = useState<ILoyaltyLedgerEntry[]>([]);
  const [voucherTab, setVoucherTab] = useState<"active" | "used" | "expired">("active");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLedger, setShowLedger] = useState(false);

  useEffect(() => {
    async function loadAccountData() {
      setIsLoading(true);
      try {
        const [accRes, vouchersRes, ledgerRes] = await Promise.allSettled([
          loyaltyApi.getCustomerAccount(),
          loyaltyApi.getCustomerVouchers(),
          loyaltyApi.getCustomerLedger(),
        ]);

        if (accRes.status === "fulfilled") {
          setAccount(accRes.value.account);
          setSettings(accRes.value.settings);
        }
        if (vouchersRes.status === "fulfilled") {
          setVouchers(vouchersRes.value);
        }
        if (ledgerRes.status === "fulfilled") {
          setLedger(ledgerRes.value);
        }
      } catch (err: any) {
        console.error("Failed to load account data:", err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAccountData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    notify.success(`Voucher code ${code} copied!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (voucherTab === "active") return v.status === "active";
    if (voucherTab === "used") return v.status === "redeemed";
    return v.status === "expired" || v.status === "voided" || v.status === "paused";
  });

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary transition mb-2"
            >
              <FaArrowLeft className="w-3 h-3" />
              <span>Back to Store</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Account & Rewards
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Track your purchase progress, vouchers wallet, and member benefits.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/account/orders"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-800 text-xs font-bold transition shadow-2xs"
            >
              <FaBoxOpen className="w-3.5 h-3.5 text-primary" />
              <span>My Orders</span>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <FaSpinner className="w-6 h-6 animate-spin text-primary" />
            <p className="text-xs font-semibold">Loading your rewards dashboard...</p>
          </div>
        ) : (
          <>
            {/* Loyalty Progress Card */}
            <LoyaltyProgressCard account={account} settings={settings} />

            {/* Voucher Wallet Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FaTicketAlt className="w-4 h-4 text-primary" />
                  <h2 className="text-base font-bold text-slate-900">
                    My Voucher Wallet (আমার ভাউচার)
                  </h2>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setVoucherTab("active")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      voucherTab === "active"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Active ({vouchers.filter((v) => v.status === "active").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherTab("used")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      voucherTab === "used"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Used ({vouchers.filter((v) => v.status === "redeemed").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoucherTab("expired")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      voucherTab === "expired"
                        ? "bg-white text-slate-900 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Expired / Void
                  </button>
                </div>
              </div>

              {/* Vouchers List */}
              {filteredVouchers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredVouchers.map((v) => {
                    const isCopied = copiedCode === v.code;
                    return (
                      <div
                        key={v._id}
                        className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                          v.status === "active"
                            ? "bg-orange-50/40 border-orange-200/90 shadow-2xs"
                            : "bg-slate-50 border-slate-200 opacity-75"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                              {v.source === "loyalty" ? "Loyalty Reward" : "Promotional"}
                            </span>
                            <div className="mt-2 flex items-baseline gap-1.5">
                              <span className="text-xl font-mono font-black text-slate-900">
                                {v.discountType === "fixed" ? formatTaka(v.value) : `${v.value}%`}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">OFF</span>
                            </div>
                          </div>

                          {v.status === "active" && (
                            <button
                              type="button"
                              onClick={() => handleCopyCode(v.code)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-orange-300 hover:bg-orange-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer"
                              title="Copy code"
                            >
                              {isCopied ? (
                                <>
                                  <FaCheck className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">Copied</span>
                                </>
                              ) : (
                                <>
                                  <FaCopy className="w-3 h-3 text-slate-400" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Code Display */}
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 font-mono font-black text-xs text-slate-800 tracking-wider flex items-center justify-between">
                          <span>{v.code}</span>
                          <span className="text-[10px] font-sans font-semibold text-slate-400">
                            Min Order: {formatTaka(v.minOrderAmount)}
                          </span>
                        </div>

                        {/* Expiry / Status */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <FaClock className="w-3 h-3 text-slate-400" />
                            <span>Expires: {formatAdminDate(v.expiresAt)}</span>
                          </span>
                          <span
                            className={`font-bold capitalize ${
                              v.status === "active"
                                ? "text-emerald-600"
                                : v.status === "redeemed"
                                ? "text-blue-600"
                                : "text-slate-400"
                            }`}
                          >
                            {v.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 space-y-1">
                  <p className="text-xs font-semibold">No vouchers in this category.</p>
                  <p className="text-[11px]">
                    Every {formatTaka(settings?.targetAmount || 4000)} of delivered purchases earns you a new voucher!
                  </p>
                </div>
              )}
            </div>

            {/* Collapsible Ledger / Progress History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaHistory className="w-4 h-4 text-primary" />
                  <h2 className="text-base font-bold text-slate-900">
                    Progress Ledger History (পয়েন্ট হিস্ট্রি)
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLedger(!showLedger)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  {showLedger ? "Hide History" : `View Entries (${ledger.length})`}
                </button>
              </div>

              {showLedger && (
                <div className="pt-2 overflow-x-auto">
                  {ledger.length > 0 ? (
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Order</th>
                          <th className="py-2.5 px-3 text-right">Amount</th>
                          <th className="py-2.5 px-3">Status / Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {ledger.map((entry) => (
                          <tr key={entry._id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 px-3 text-slate-500 font-mono">
                              {formatAdminDate(entry.createdAt)}
                            </td>
                            <td className="py-2.5 px-3 font-semibold">
                              {entry.type === "earn_eligible" && (
                                <span className="text-emerald-700">Eligible Spend</span>
                              )}
                              {entry.type === "earn_pending" && (
                                <span className="text-amber-700">Pending Hold</span>
                              )}
                              {entry.type === "voucher_issue" && (
                                <span className="text-purple-700">Voucher Issued</span>
                              )}
                              {entry.type === "reversal" && (
                                <span className="text-rose-700">Reversal / Return</span>
                              )}
                              {entry.type === "manual_credit" && (
                                <span className="text-blue-700">Admin Credit</span>
                              )}
                              {entry.type === "manual_debit" && (
                                <span className="text-rose-700">Admin Debit</span>
                              )}
                              {entry.type === "welcome" && (
                                <span className="text-orange-700">Welcome Bonus</span>
                              )}
                              {entry.type === "import" && (
                                <span className="text-slate-700">Past Purchase Import</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-800">
                              {entry.orderNo || "-"}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-mono font-bold ${
                                entry.amount >= 0 ? "text-emerald-700" : "text-rose-700"
                              }`}
                            >
                              {entry.amount >= 0 ? `+${formatTaka(entry.amount)}` : `-${formatTaka(Math.abs(entry.amount))}`}
                            </td>
                            <td className="py-2.5 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                              {entry.reason || (entry.eligibleAt ? `Matures: ${formatAdminDate(entry.eligibleAt)}` : "-")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No progress history recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
