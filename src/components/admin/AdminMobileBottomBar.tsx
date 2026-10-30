"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaChartPie,
  FaCashRegister,
  FaClipboardList,
  FaBoxes,
  FaBars,
  FaTimes,
  FaCalculator,
  FaTruck,
  FaTags,
  FaGift,
  FaUndoAlt,
  FaExternalLinkAlt,
  FaSignOutAlt,
  FaCheckCircle,
} from "react-icons/fa";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const PRIMARY_TABS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: FaChartPie, exact: true },
  { href: "/admin/sales", label: "Sales", icon: FaCashRegister },
  { href: "/admin/preorders", label: "Pre-orders", icon: FaClipboardList },
  { href: "/admin/stock", label: "Stock", icon: FaBoxes },
];

const MORE_NAV_ITEMS: NavItem[] = [
  { href: "/admin/costing", label: "Costing & Pricing", icon: FaCalculator },
  { href: "/admin/shipments", label: "Courier Logistics", icon: FaTruck },
  { href: "/admin/products", label: "Products Catalog", icon: FaTags },
  { href: "/admin/vouchers", label: "Vouchers & Loyalty", icon: FaGift },
  { href: "/admin/refunds", label: "Refund Requests", icon: FaUndoAlt },
];

export default function AdminMobileBottomBar() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMoreOpen]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hatkhola_admin_token");
      window.location.href = "/";
    }
  };

  const isMoreActive = MORE_NAV_ITEMS.some((item) =>
    pathname.startsWith(item.href)
  );

  return (
    <>
      {/* Slide-Up Bottom Drawer for "More" Menu */}
      {isMoreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="relative bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl p-5 max-h-[85vh] overflow-y-auto z-10 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-primary flex items-center justify-center font-bold text-xs">
                  HB
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    Operations Console
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    All Management Modules
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                aria-label="Close menu"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="space-y-1">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                More Modules
              </span>
              {MORE_NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-orange-50 text-orange-700 border border-orange-200/80"
                        : "text-slate-700 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-orange-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions & Storefront Link */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Public Storefront</span>
                </span>
                <FaExternalLinkAlt className="text-[10px] text-slate-400" />
              </Link>

              <div className="flex items-center gap-2 px-3 py-1 text-[11px] text-emerald-700 font-medium">
                <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
                <span>ACID Mongo Transactions Active</span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-extrabold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition cursor-pointer"
              >
                <FaSignOutAlt className="text-xs" />
                <span>Exit Operations Console</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Bar */}
      <nav
        aria-label="Mobile admin navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1.5 py-1 flex items-center justify-around safe-bottom"
      >
        {PRIMARY_TABS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? "text-primary bg-orange-50/70"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-4 h-4 mb-0.5 ${
                  isActive ? "text-primary scale-110" : "text-slate-400"
                } transition-transform`}
              />
              <span className="truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th Tab: More Button */}
        <button
          type="button"
          onClick={() => setIsMoreOpen((prev) => !prev)}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
            isMoreActive || isMoreOpen
              ? "text-primary bg-orange-50/70"
              : "text-slate-500 hover:text-slate-900"
          }`}
          aria-label="More administration options"
          aria-expanded={isMoreOpen}
        >
          <FaBars
            className={`w-4 h-4 mb-0.5 ${
              isMoreActive || isMoreOpen ? "text-primary scale-110" : "text-slate-400"
            } transition-transform`}
          />
          <span>Menu</span>
        </button>
      </nav>
    </>
  );
}

