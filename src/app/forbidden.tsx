"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaShieldAlt, FaHome, FaArrowLeft, FaSignInAlt } from "react-icons/fa";

export default function Forbidden() {
  const router = useRouter();

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-amber-50/30">
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Brand Logo with Protected Lock / Shield Indicator */}
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm border border-amber-200/60 mb-6 p-2">
          <Image
            src="/hatkhola-logo.png"
            alt="Hatkhola Bazar"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-xs shadow-md border-2 border-white">
            <FaShieldAlt />
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-red-100 text-red-800 border border-red-200">
            HTTP 403 - Forbidden / Access Denied
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-7xl sm:text-8xl font-black text-slate-900 tracking-tight font-sans">
          4<span className="text-red-600">0</span>3
        </h1>

        {/* Title */}
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
          Access Restricted / Protected Page
        </h2>
        <p className="mt-1 text-sm sm:text-base font-medium text-amber-900/80">
          সুরক্ষিত পৃষ্ঠা - প্রবেশাধিকার সংরক্ষিত
        </p>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          You do not have administrative permissions to view this protected area.
          If you are signed in with a standard customer account, you cannot access
          internal operations or administration tools.
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
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#e07a1e] hover:bg-[#c86510] rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <FaHome />
            Return to Storefront
          </Link>

          <Link
            href="/login?redirect=/admin"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <FaSignInAlt className="text-slate-600" />
            Admin Login
          </Link>
        </div>

        {/* Security Notice */}
        <div className="mt-12 p-4 rounded-xl bg-white border border-slate-200/80 max-w-md mx-auto text-xs text-slate-500 leading-normal">
          <p className="font-semibold text-slate-700 mb-1">
            Need administrator access?
          </p>
          Please make sure you are signed in with the authorized administrator email
          address configured for this store.
        </div>
      </div>
    </main>
  );
}

