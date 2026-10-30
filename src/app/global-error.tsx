"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FaRedoAlt, FaHome } from "react-icons/fa";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("Global application error:", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-amber-50/40 text-slate-800 font-sans antialiased">
        <div className="w-full max-w-md mx-auto text-center p-8 rounded-3xl bg-white border border-amber-200/80 shadow-lg">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-[#e07a1e] font-bold text-xl mb-4">
            HB
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Unexpected Application Error
          </h1>
          <p className="mt-1 text-xs font-semibold text-amber-900/80">
            সাময়িক ত্রুটি দেখা দিয়েছে
          </p>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            An unexpected error occurred. Please click below to reload the application.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#e07a1e] hover:bg-[#c86510] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <FaRedoAlt className="text-3xs" />
              Reload Page
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <FaHome className="text-xs" />
              Storefront
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}

