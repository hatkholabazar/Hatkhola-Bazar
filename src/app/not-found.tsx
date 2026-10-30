"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaArrowLeft,
  FaShoppingBag,
  FaBoxOpen,
  FaSearch,
} from "react-icons/fa";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-amber-50/30">
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-sm border border-amber-200/60 mb-6 p-2">
          <Image
            src="/hatkhola-logo.png"
            alt="Hatkhola Bazar"
            width={64}
            height={64}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Status Badge */}
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 border border-amber-200">
            HTTP 404 - Not Found
          </span>
        </div>

        {/* Large 404 Heading */}
        <h1 className="mt-4 text-7xl sm:text-8xl font-black text-slate-900 tracking-tight font-sans">
          4<span className="text-[#e07a1e]">0</span>4
        </h1>

        {/* Title */}
        <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">
          Page Not Found
        </h2>
        <p className="mt-1 text-sm sm:text-base font-medium text-amber-900/80">
          পৃষ্ঠাটি খুঁজে পাওয়া যায়নি
        </p>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
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
        </div>

        {/* Helpful Quick Links */}
        <div className="mt-12 pt-8 border-t border-amber-200/60">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Popular Destinations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Link
              href="/#products"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-[#e07a1e] flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                <FaShoppingBag />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800">
                  Products
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  ঘি ও খেজুর গুড়
                </div>
              </div>
            </Link>

            <Link
              href="/account/orders"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                <FaBoxOpen />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800">
                  My Orders
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Track delivery
                </div>
              </div>
            </Link>

            <Link
              href="/checkout"
              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 hover:bg-amber-50/40 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm group-hover:scale-105 transition-transform">
                <FaSearch />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800">
                  Checkout
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  View your cart
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

