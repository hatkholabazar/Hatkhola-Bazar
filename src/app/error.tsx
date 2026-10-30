"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaRedoAlt, FaHome, FaExclamationTriangle } from "react-icons/fa";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client error in production monitoring
    if (process.env.NODE_ENV !== "production") {
      console.error("Application runtime error:", error);
    }
  }, [error]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-amber-50/30">
      <div className="w-full max-w-lg mx-auto text-center">
        {/* Brand Logo with Warning Badge */}
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
            <FaExclamationTriangle />
          </div>
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 border border-amber-200">
            System Notice
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Something Went Wrong
        </h1>
        <p className="mt-1 text-sm sm:text-base font-medium text-amber-900/80">
          একটি অপ্রত্যাশিত সমস্যা দেখা দিয়েছে
        </p>

        {/* Description */}
        <p className="mt-4 text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          We encountered a temporary issue while loading this section. Please try
          refreshing or return to the storefront.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#e07a1e] hover:bg-[#c86510] rounded-xl shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
          >
            <FaRedoAlt className="text-xs" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
          >
            <FaHome />
            Return to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}

