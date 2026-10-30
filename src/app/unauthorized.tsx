"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaLock, FaHome, FaArrowLeft, FaSignInAlt, FaUserPlus } from "react-icons/fa";

export default function Unauthorized() {
  const router = useRouter();

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-amber-50/30">
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Brand Logo with Lock Indicator */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm border border-amber-200/60 mb-6 p-2">
          <Image
            src="/hatkhola-logo.png"
            alt="Hatkhola Bazar"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
            <FaLock />
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 border border-amber-200">
            HTTP 401 - Unauthorized / Authentication Required
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-7xl sm:text-8xl font-black text-slate-900 tracking-tight font-sans">
          4<span className="text-[#e07a1e]">0</span>1
        </h1>

        {/* Title */}
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
          Authentication Required
        </h2>
        <p className="mt-1 text-sm sm:text-base font-medium text-amber-900/80">
          প্রবেশের জন্য লগইন আবশ্যক
        </p>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          You must be signed in to access this protected area. Please sign in to your
          Hatkhola Bazar account to view your orders, profile, and account details.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <FaArrowLeft className="text-slate-500" />
            Go Back
          </button>

          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#e07a1e] hover:bg-[#c86510] rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <FaSignInAlt />
            Sign In Now
          </Link>

          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <FaUserPlus className="text-slate-500" />
            Create Account
          </Link>
        </div>

        {/* Home link */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <FaHome />
            Return to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}

