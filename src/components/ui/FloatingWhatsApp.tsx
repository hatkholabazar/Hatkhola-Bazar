"use client";

import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function FloatingWhatsApp() {
  const { business } = siteConfig;
  const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${business.name}, I want to order authentic products.`
  )}`;

  return (
    <aside aria-label="Quick contact" className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/40 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
      >
        {/* Pulsing halo */}
        <span className="absolute -inset-1 rounded-full bg-emerald-400 opacity-40 animate-ping pointer-events-none" />

        <FaWhatsapp className="w-8 h-8 relative z-10" />

        {/* Tooltip on Desktop */}
        <span className="hidden sm:block absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
          Order on WhatsApp
        </span>
      </a>
    </aside>
  );
}

