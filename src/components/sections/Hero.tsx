"use client";

import Image from "next/image";
import { FaStar, FaShieldAlt } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function Hero() {
  const { business } = siteConfig;

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-amber-50/40 to-transparent pt-8 pb-0 sm:pt-12 sm:pb-0 border-b border-orange-100/60"
    >
      {/* Decorative Warm Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-orange-200/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-2xl bg-white shadow-md shadow-orange-500/10 p-2 border border-orange-200 flex items-center justify-center">
            <Image
              src="/hatkhola-logo.png"
              alt="Hatkhola-Bazar Logo"
              width={88}
              height={88}
              priority
              className="object-contain"
            />
          </div>
          <span className="text-xs uppercase tracking-widest font-extrabold text-primary bg-orange-100/70 px-3.5 py-1 rounded-full whitespace-nowrap">
            Authentic Village Heritage
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
            {business.name}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-orange-800/80 mt-1 uppercase tracking-wider">
            Pure & Natural Local Bazar
          </p>
        </div>

        {/* Tagline */}
        <h2 className="text-xl sm:text-3xl font-bold text-slate-800 leading-snug max-w-2xl mx-auto mb-4">
          {business.tagline.split(" & ").map((part, index, arr) => (
            <span key={index}>
              {part}
              {index < arr.length - 1 && (
                <>
                  {" &"}
                  <br />
                </>
              )}
            </span>
          ))}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto mb-6 leading-relaxed">
          {business.subTagline}
        </p>

        {/* Trust Highlight Pill */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/95 border border-orange-200 shadow-sm rounded-full px-3 sm:px-4 py-1.5 mb-8 text-[11px] sm:text-xs md:text-sm font-semibold text-slate-700 whitespace-nowrap max-w-full">
          <div className="flex text-amber-500 shrink-0">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
            ))}
          </div>
          <span className="text-slate-300 font-normal">|</span>
          <span className="text-orange-950 font-bold whitespace-nowrap">{business.trustLineEn}</span>
        </div>

        {/* Delivery Guarantee Strip */}
        <div className="py-4 border-t border-orange-200/50 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <FaShieldAlt className="text-primary w-4 h-4 shrink-0" />
            100% Cash on Delivery
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            Nationwide Home Delivery
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            Directly from Village Artisans
          </span>
        </div>
      </div>
    </section>
  );
}
