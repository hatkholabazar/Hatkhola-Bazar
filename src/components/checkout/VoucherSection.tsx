"use client";

import React, { useState } from "react";
import { formatTaka } from "@/config/admin-labels";
import { loyaltyApi, IVoucher, IVoucherEvaluationResult } from "@/lib/loyalty-api";
import { notify } from "@/lib/notify";
import { FaTag, FaCheck, FaTimes, FaGift, FaSpinner } from "react-icons/fa";

export interface VoucherSectionProps {
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    productCode?: string;
  }[];
  phone?: string;
  appliedVoucher: IVoucherEvaluationResult | null;
  onApplyVoucher: (result: IVoucherEvaluationResult) => void;
  onRemoveVoucher: () => void;
  customerVouchers?: IVoucher[];
}

export function VoucherSection({
  items,
  phone,
  appliedVoucher,
  onApplyVoucher,
  onRemoveVoucher,
  customerVouchers = [],
}: VoucherSectionProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = async (voucherCodeToApply?: string) => {
    const targetCode = (voucherCodeToApply || code).trim().toUpperCase();
    if (!targetCode) {
      notify.error("Please enter a voucher code");
      return;
    }

    if (items.length === 0) {
      notify.error("Your cart is empty");
      return;
    }

    setIsLoading(true);
    try {
      const evaluation = await loyaltyApi.validateVoucher({
        code: targetCode,
        items,
        phone,
      });

      if (!evaluation.isValid) {
        notify.error(evaluation.error || "This voucher cannot be applied to this order.");
        return;
      }

      onApplyVoucher(evaluation);
      setCode("");
      notify.success(`Voucher applied! You saved ${formatTaka(evaluation.discountAmount)}`);
    } catch (err: any) {
      notify.error(err.message || "Failed to validate voucher");
    } finally {
      setIsLoading(false);
    }
  };

  const activeCustomerVouchers = customerVouchers.filter((v) => {
    if (v.status !== "active") return false;
    if (v.expiresAt && new Date(v.expiresAt) <= new Date()) return false;
    if (v.usageLimitTotal !== null && v.usageLimitTotal !== undefined) {
      if ((v.usedCount || 0) + (v.reservedCount || 0) >= v.usageLimitTotal) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-xs">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <FaTag className="w-3.5 h-3.5 text-primary" />
        <span>Voucher or Discount Code (ভাউচার কোড)</span>
      </div>

      {appliedVoucher ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FaCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold">{appliedVoucher.code}</p>
              <p className="text-[11px] text-emerald-700 font-medium">
                Discount: <strong className="font-bold">{formatTaka(appliedVoucher.discountAmount)}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveVoucher}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Remove voucher"
            aria-label="Remove applied voucher"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. HB-8X92-3KL4"
              className="flex-1 px-3.5 py-2.5 text-xs font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleApply();
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleApply()}
              disabled={isLoading || !code.trim()}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="w-3 h-3 animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>

          {/* Quick Apply Available Vouchers from Customer Wallet */}
          {activeCustomerVouchers.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                <FaGift className="w-3 h-3 text-primary" />
                <span>Your Available Vouchers:</span>
              </p>
              <div className="space-y-1.5">
                {activeCustomerVouchers.map((v) => (
                  <div
                    key={v._id}
                    className="flex items-center justify-between p-2 rounded-xl bg-orange-50/60 border border-orange-200/70 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-800">{v.code}</span>
                      <span className="text-[11px] text-slate-500 ml-2">
                        {v.discountType === "fixed" ? formatTaka(v.value) : `${v.value}%`} off
                        {v.minOrderAmount > 0 && ` (Min ${formatTaka(v.minOrderAmount)})`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApply(v.code)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-lg bg-primary hover:bg-primary-hover text-white text-[11px] font-bold transition cursor-pointer"
                    >
                      Use
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

