"use client";

import React from "react";
import Link from "next/link";
import { formatTaka } from "@/config/admin-labels";
import { ProgressBar } from "../loyalty/ProgressBar";
import { FaGift, FaCoins, FaCheckCircle, FaArrowRight, FaShieldAlt } from "react-icons/fa";

export function RewardsSection() {
  return (
    <section id="rewards" className="py-16 sm:py-24 bg-linear-to-b from-orange-50/40 via-white to-amber-50/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold uppercase tracking-wider">
            <FaGift className="w-3.5 h-3.5 text-primary" />
            <span>Hatkhola Rewards Program</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Buy Pure Food. Earn Rewards Forever.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Every time your delivered purchases reach {formatTaka(4000)}, you automatically receive a {formatTaka(250)} voucher. Any extra spend seamlessly carries over to your next reward cycle.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary font-mono font-black text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Shop Handcrafted Goods
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Order our artisanal Danadar Ghee, Date Palm Jhola Gur, or pure wood-pressed oils. Every delivered taka counts.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary font-mono font-black text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Watch Your Bar Fill
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Follow your verified spend on your customer dashboard. Upon reaching {formatTaka(4000)}, your {formatTaka(250)} voucher is automatically issued.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-primary font-mono font-black text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Zero Lost Taka Rule
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Spend {formatTaka(4300)}? You get your {formatTaka(250)} voucher and {formatTaka(300)} instantly carries over to fill your next bar.
            </p>
          </div>
        </div>

        {/* Live Preview Demo Card */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-orange-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FaCoins className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Example Progress</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Active Member
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <span className="text-2xl font-mono font-black text-slate-900">{formatTaka(2850)}</span>
              <span className="text-xs font-semibold text-slate-500">Target: {formatTaka(4000)}</span>
            </div>
            <ProgressBar current={2850} target={4000} label="Current cycle progress" />
            <p className="text-xs text-slate-500 font-medium">
              Only <strong className="text-orange-700">{formatTaka(1150)}</strong> more to receive your next {formatTaka(250)} voucher.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FaShieldAlt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>3-day delivery hold protects genuine customers</span>
            </div>
            <Link
              href="/profile?tab=rewards"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition shadow-xs cursor-pointer whitespace-nowrap"
            >
              <span>View in Profile</span>
              <FaArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

