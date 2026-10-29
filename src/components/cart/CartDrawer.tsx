"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaTimes,
  FaShoppingBag,
  FaTrashAlt,
  FaPlus,
  FaMinus,
  FaShieldAlt,
  FaArrowRight,
  FaWhatsapp,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";

export default function CartDrawer() {
  const router = useRouter();
  const { business } = siteConfig;
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    isDrawerOpen,
    closeDrawer,
    totalCount,
    subtotal,
  } = useCart();

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const handleProceedToCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  const generateWhatsAppCartInquiry = () => {
    const itemsList = items
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.option}) × ${item.quantity} = ৳${item.price * item.quantity}`
      )
      .join("\n");

    const message = `Hi ${business.name},
I have the following items in my cart:

${itemsList}

Items Subtotal: ৳${subtotal}
Please assist me with ordering. Thank you!`;

    return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  if (!isDrawerOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-orange-200 animate-slide-in-right">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-primary flex items-center justify-center">
                <FaShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Shopping Cart</span>
                  {totalCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold font-sans">
                      {totalCount}
                    </span>
                  )}
                </h2>
                <p className="text-3xs text-slate-500 font-medium">
                  {items.length > 0
                    ? `${totalCount} item(s) selected`
                    : "Your cart is currently empty"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close cart"
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition cursor-pointer"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              /* EMPTY CART */
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-20 h-20 rounded-3xl bg-orange-50 text-orange-300 flex items-center justify-center mb-4">
                  <FaShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Your cart is currently empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1 mb-6">
                  Add our pure Danadar Ghee or Winter Special Khejur Gur to proceed with online ordering.
                </p>
                <Link
                  href="/#products"
                  onClick={closeDrawer}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs whitespace-nowrap shadow-sm transition cursor-pointer"
                >
                  <span>Browse Products</span>
                  <FaArrowRight className="w-3 h-3 shrink-0" />
                </Link>
              </div>
            ) : (
              /* ITEMS LIST */
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Selected Items ({totalCount})
                  </span>
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-3xs font-semibold text-slate-400 hover:text-red-500 transition cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/70 flex gap-3 items-center hover:bg-slate-50 transition"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-3xs text-primary font-semibold truncate">
                          {item.option}
                        </p>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              aria-label="Decrease quantity"
                              className="w-5 h-5 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            >
                              <FaMinus className="w-2 h-2" />
                            </button>
                            <span className="w-7 text-center font-bold text-xs font-sans text-slate-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              aria-label="Increase quantity"
                              className="w-5 h-5 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer"
                            >
                              <FaPlus className="w-2 h-2" />
                            </button>
                          </div>

                          <span className="text-xs font-black text-slate-900 font-sans">
                            ৳ {item.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        title="Remove Item"
                        className="text-slate-300 hover:text-red-500 transition p-1.5 cursor-pointer ml-1"
                      >
                        <FaTrashAlt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Redesigned Professional Trust Badge (Item 2) */}
                <div className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 p-3.5 flex items-center gap-3 shadow-2xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/50">
                    <FaShieldAlt className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900">100% Authentic & Safe Delivery</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-3xs text-slate-600 font-medium mt-0.5 leading-snug">
                      Open & verify package condition before making payment to the courier rider
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Proceed to Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-orange-100 bg-orange-50/30 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Subtotal ({totalCount} items)
                </span>
                <span className="text-lg sm:text-xl font-black text-primary font-sans">
                  ৳ {subtotal}
                </span>
              </div>
              <p className="text-3xs text-slate-500">
                Delivery charges (Inside Chittagong ৳60 / Outside Chittagong ৳120) calculated at checkout page.
              </p>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 sm:px-5 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md shadow-orange-500/25 transition cursor-pointer transform active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <FaArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="flex-1 py-2 px-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-orange-100/50 text-xs font-bold whitespace-nowrap transition text-center cursor-pointer"
                >
                  Continue Shopping
                </button>

                <a
                  href={generateWhatsAppCartInquiry()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-2 px-2.5 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold whitespace-nowrap transition cursor-pointer border border-emerald-200 shrink-0"
                >
                  <FaWhatsapp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
