"use client";

import React from "react";
import { formatTaka } from "@/config/admin-labels";
import { ProgressBar } from "./ProgressBar";
import { FaGift, FaCoins, FaClock, FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import { ILoyaltyAccount, IPublicLoyaltySettings } from "@/lib/loyalty-api";

export interface LoyaltyProgressProps {
  account: ILoyaltyAccount | null;
  settings: IPublicLoyaltySettings | null;
  className?: string;
}

export function LoyaltyProgress({ account, settings, className = "" }: LoyaltyProgressProps) {
  const target = settings?.targetAmount || 4000;
  const reward = settings?.rewardAmount || 250;
  const minOrder = settings?.minOrderToRedeem || 2000;
  const current = account?.progressBalance || 0;
  const pending = account?.pendingAmount || 0;
  const remaining = Math.max(0, target - current);
  const vouchersIssued = account?.vouchersIssuedCount || 0;

  const isComplete = current >= target;

  return (
    <section
      role="region"
      aria-label="Hatkhola Rewards Progress"
      className={`bg-linear-to-br from-orange-50/70 via-white to-amber-50/50 border border-orange-200/90 rounded-2xl p-5 sm:p-6 shadow-xs ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <FaGift className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Hatkhola Rewards</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                রিওয়ার্ডস
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Earn a {formatTaka(reward)} voucher for every {formatTaka(target)} of delivered goods.
            </p>
          </div>
        </div>

        {/* Lifetime summary badges */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Vouchers Earned</p>
            <p className="text-xs font-mono font-bold text-slate-800">{vouchersIssued}</p>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-right shadow-2xs">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Lifetime Spend</p>
            <p className="text-xs font-mono font-bold text-emerald-700">
              {formatTaka(account?.lifetimeEligibleSpend || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Core */}
      <div className="pt-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 tracking-tight">
              {formatTaka(current)}
            </span>
            <span className="text-sm font-bold text-slate-400 ml-1.5">
              / {formatTaka(target)}
            </span>
          </div>

          <div className="text-right">
            {isComplete ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                <FaCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Target reached! Voucher issuing...
              </span>
            ) : (
              <p className="text-xs font-semibold text-slate-700">
                Spend <strong className="text-orange-700 font-bold">{formatTaka(remaining)}</strong> more
              </p>
            )}
          </div>
        </div>

        {/* Accessible Progress Bar */}
        <ProgressBar
          current={current}
          target={target}
          showPercent={true}
          label="Progress toward next reward"
        />

        {/* Pending hold notice */}
        {pending > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs">
            <FaClock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <p className="font-medium">
              <strong className="font-bold">{formatTaka(pending)}</strong> is in delivery hold and will count toward your progress once verified.
            </p>
          </div>
        )}

        {/* Rules note */}
        <div className="pt-1 flex items-start gap-2 text-[11px] text-slate-500 font-normal">
          <FaInfoCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Voucher can be redeemed on orders of {formatTaka(minOrder)} or more. Extra spend automatically carries over into your next bar forever.
          </p>
        </div>
      </div>
    </section>
  );
}

