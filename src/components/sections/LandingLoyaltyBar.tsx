"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { loyaltyApi, ILoyaltyAccount, IPublicLoyaltySettings } from "@/lib/loyalty-api";
import { LoyaltyProgress } from "@/components/loyalty/LoyaltyProgress";
import {
  FaGift,
  FaArrowRight,
  FaCheckCircle,
  FaCoins,
  FaShieldAlt,
  FaSearch,
  FaMobileAlt,
  FaUserCheck,
  FaRedoAlt,
} from "react-icons/fa";

// Sample demonstration account for logged-out visitors to illustrate live progress
const DEMO_ACCOUNT: ILoyaltyAccount = {
  _id: "demo",
  phone: "01XXXXXXXXX",
  progressBalance: 2800,
  pendingAmount: 0,
  lifetimeEligibleSpend: 6800,
  vouchersIssuedCount: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function LandingLoyaltyBar() {
  const { data: session } = authClient.useSession();
  const [account, setAccount] = useState<ILoyaltyAccount | null>(null);
  const [settings, setSettings] = useState<IPublicLoyaltySettings | null>({
    loyaltyEnabled: true,
    targetAmount: 4000,
    rewardAmount: 250,
    minOrderToRedeem: 2000,
    voucherExpiryDays: 90,
  });

  // Logged-out state controls
  const [guestTab, setGuestTab] = useState<"preview" | "lookup">("preview");
  const [phoneInput, setPhoneInput] = useState("");
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);
  const [phoneMessage, setPhoneMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Load user data if logged in
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        let storedPhone: string | undefined;
        try {
          const stored = localStorage.getItem("hatkhola_customer_profile");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.phone) storedPhone = parsed.phone;
          }
        } catch {
          // Ignore storage read errors
        }

        const token = (session as any)?.session?.token;

        if (session?.user || storedPhone) {
          const res = await loyaltyApi.getCustomerAccount(storedPhone, token);
          if (isMounted) {
            if (res.account) setAccount(res.account);
            if (res.settings) setSettings(res.settings);
          }
        } else {
          const pubSettings = await loyaltyApi.getPublicSettings();
          if (isMounted && pubSettings) {
            setSettings(pubSettings);
          }
        }
      } catch {
        // Silently preserve baseline defaults
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const targetAmount = settings?.targetAmount || 4000;
  const rewardAmount = settings?.rewardAmount || 250;

  // Handle logged-out phone lookup
  const handlePhoneLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phoneInput.trim().replace(/[^0-9]/g, "");
    if (!clean || clean.length < 10) {
      setPhoneMessage({
        type: "error",
        text: "Please enter a valid 11-digit mobile number.",
      });
      return;
    }

    setIsCheckingPhone(true);
    setPhoneMessage(null);

    try {
      const res = await loyaltyApi.getCustomerAccount(clean);
      if (res.account && (res.account.progressBalance > 0 || res.account.lifetimeEligibleSpend > 0 || res.account.vouchersIssuedCount > 0)) {
        setAccount(res.account);
        setPhoneMessage({
          type: "success",
          text: `Found customer records for ${clean}! Showing your live balance below.`,
        });
      } else {
        setPhoneMessage({
          type: "info",
          text: `No delivered orders found for ${clean} yet. Place your first order to start building your rewards!`,
        });
      }
    } catch {
      setPhoneMessage({
        type: "error",
        text: "Could not retrieve records for this number. Please try again.",
      });
    } finally {
      setIsCheckingPhone(false);
    }
  };

  const handleResetGuestView = () => {
    setAccount(null);
    setPhoneMessage(null);
    setPhoneInput("");
    setGuestTab("preview");
  };

  const isUserLoggedIn = Boolean(session?.user);

  return (
    <section className="py-10 sm:py-14 bg-linear-to-b from-white via-orange-50/25 to-white border-b border-orange-100/70">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header & Headline */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-100/90 text-orange-950 border border-orange-200 text-xs font-black uppercase tracking-wider shadow-2xs">
            <FaGift className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>Hatkhola Loyalty Perks • রিওয়ার্ডস প্রোগ্রাম</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Shop Pure Food.
            <br />
            <span className="text-primary">Earn Guaranteed Cash Vouchers.</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-medium">
            Every delivered taka counts automatically. For every <strong>৳ {targetAmount.toLocaleString()}</strong> of genuine artisanal goods delivered to your doorstep, receive a free <strong>৳ {rewardAmount.toLocaleString()} voucher</strong>. No points lost—extra spend rolls over forever!
          </p>
        </div>

        {/* 3 Value Proposition Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto mb-6">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-orange-100/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-primary flex items-center justify-center shrink-0">
              <FaCheckCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">Automatic Tracking</p>
              <p className="text-[11px] text-slate-500">Linked to your mobile number</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-orange-100/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <FaCoins className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">Zero Lost Taka</p>
              <p className="text-[11px] text-slate-500">Extra spend rolls over forever</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-white border border-orange-100/90 shadow-2xs">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <FaShieldAlt className="w-3.5 h-3.5" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">৳ {rewardAmount.toLocaleString()} Cash Voucher</p>
              <p className="text-[11px] text-slate-500">Instant code upon parcel delivery</p>
            </div>
          </div>
        </div>

        {/* LOGGED OUT USER MODE SWITCHER & QUICK LOOKUP */}
        {!isUserLoggedIn && (
          <div className="mb-4 p-4 rounded-2xl bg-white border border-orange-200/90 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-orange-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-900 font-extrabold text-[11px] uppercase tracking-wider">
                  Visitor View
                </span>
                <span className="text-xs text-slate-600 font-medium">
                  {guestTab === "preview"
                    ? "Viewing an interactive example of how rewards fill."
                    : "Check your rewards balance using your mobile number."}
                </span>
              </div>

              {/* Guest Tabs Toggle */}
              <div className="inline-flex rounded-xl bg-orange-50/80 p-1 border border-orange-200/60 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setGuestTab("preview")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    guestTab === "preview"
                      ? "bg-white text-orange-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Example Demo
                </button>
                <button
                  type="button"
                  onClick={() => setGuestTab("lookup")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    guestTab === "lookup"
                      ? "bg-white text-orange-950 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FaMobileAlt className="w-3 h-3 text-primary" />
                  <span>Check by Phone</span>
                </button>
              </div>
            </div>

            {/* If in lookup mode, display the mobile lookup form */}
            {guestTab === "lookup" ? (
              <form onSubmit={handlePhoneLookup} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="Enter your 11-digit mobile number (e.g. 017...)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-orange-200 bg-orange-50/30 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary focus:bg-white transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isCheckingPhone}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:bg-slate-300 text-white font-bold text-xs shadow-xs transition cursor-pointer whitespace-nowrap"
                  >
                    <FaSearch className="w-3 h-3 shrink-0" />
                    <span>{isCheckingPhone ? "Checking..." : "Check My Balance"}</span>
                  </button>
                  {account && (
                    <button
                      type="button"
                      onClick={handleResetGuestView}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                    >
                      <FaRedoAlt className="w-2.5 h-2.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {phoneMessage && (
                  <p
                    className={`text-xs font-medium px-1 ${
                      phoneMessage.type === "success"
                        ? "text-emerald-700"
                        : phoneMessage.type === "error"
                        ? "text-rose-600"
                        : "text-amber-700"
                    }`}
                  >
                    {phoneMessage.text}
                  </p>
                )}
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                <p>
                  No password required—orders placed with Cash on Delivery automatically accumulate towards your next voucher.
                </p>
                <Link
                  href="/sign-in?redirect=/"
                  className="shrink-0 inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary-hover transition"
                >
                  <FaUserCheck className="w-3 h-3" />
                  <span>Sign In with Password</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Interactive Loyalty Progress Card */}
        <div className="relative">
          {/* Banner overlay when showing demo preview to logged-out users */}
          {!isUserLoggedIn && guestTab === "preview" && !account && (
            <div className="mb-2 px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <strong className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900 text-3xs font-extrabold uppercase">
                  Live Demo
                </strong>
                <span>Example showing a customer with ৳ 2,800 delivered spend</span>
              </span>
              <button
                type="button"
                onClick={() => setGuestTab("lookup")}
                className="text-primary hover:underline font-bold text-3xs uppercase tracking-wide cursor-pointer"
              >
                Enter your phone to check yours &rarr;
              </button>
            </div>
          )}

          <LoyaltyProgress
            account={account || (isUserLoggedIn ? null : DEMO_ACCOUNT)}
            settings={settings}
          />
        </div>

        {/* Footer Link & Explainer */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
          <span>
            {isUserLoggedIn
              ? `Logged in as ${session?.user?.name || "Customer"}. All delivered orders automatically build this bar.`
              : "All delivered orders placed via website or phone automatically earn vouchers."}
          </span>
          {isUserLoggedIn ? (
            <Link
              href="/profile?tab=rewards"
              className="font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors"
            >
              <span>View My Rewards Wallet</span>
              <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          ) : (
            <Link
              href="/sign-in?redirect=/"
              className="font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 transition-colors"
            >
              <span>Sign In to Track Rewards</span>
              <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
