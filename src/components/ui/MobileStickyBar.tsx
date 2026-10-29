"use client";

import { FaPhoneAlt, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { useCart } from "@/context/CartContext";

export default function MobileStickyBar() {
  const { business } = siteConfig;
  const { totalCount, openDrawer, subtotal } = useCart();

  return (
    <aside
      aria-label="Mobile quick actions"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-orange-200/90 py-2.5 px-3 flex items-center gap-2 shadow-2xl safe-area-bottom"
    >
      {/* Call Helpline button */}
      <a
        href={`tel:${business.phoneRaw}`}
        aria-label="Call Helpline"
        title="Call Helpline"
        className="w-11 h-11 shrink-0 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-primary flex items-center justify-center font-bold text-sm transition cursor-pointer active:scale-95"
      >
        <FaPhoneAlt className="w-4 h-4" />
      </a>

      {/* Website Direct Order / Checkout Button */}
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Order on Website"
        className="flex-1 h-11 inline-flex items-center justify-between px-3 sm:px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs whitespace-nowrap shadow-md shadow-orange-500/25 transition active:scale-98 cursor-pointer"
      >
        <div className="flex items-center gap-2 whitespace-nowrap">
          <div className="relative shrink-0">
            <FaShoppingBag className="w-4 h-4" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-white text-primary text-3xs font-black flex items-center justify-center font-sans">
                {totalCount}
              </span>
            )}
          </div>
          <span className="whitespace-nowrap">{totalCount > 0 ? "Proceed to Checkout" : "Order Online"}</span>
        </div>

        <div className="flex items-center gap-1.5 font-sans whitespace-nowrap shrink-0">
          {totalCount > 0 && <span className="font-bold">৳ {subtotal}</span>}
          <FaArrowRight className="w-3 h-3 text-white/80 shrink-0" />
        </div>
      </button>
    </aside>
  );
}
