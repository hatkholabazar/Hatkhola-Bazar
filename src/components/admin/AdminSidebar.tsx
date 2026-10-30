"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  FaChartPie,
  FaBoxes,
  FaCalculator,
  FaCashRegister,
  FaTags,
  FaUndoAlt,
  FaClipboardList,
  FaTruck,
  FaGift,
  FaSignOutAlt,
  FaExternalLinkAlt,
  FaCheckCircle,
} from "react-icons/fa";

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: FaChartPie,
    exact: true,
  },
  {
    href: "/admin/stock",
    label: "Inventory & Batches",
    icon: FaBoxes,
  },
  {
    href: "/admin/costing",
    label: "Costing & Pricing",
    icon: FaCalculator,
  },
  {
    href: "/admin/sales",
    label: "Sales & FIFO",
    icon: FaCashRegister,
  },
  {
    href: "/admin/preorders",
    label: "Pre-orders",
    icon: FaClipboardList,
  },
  {
    href: "/admin/shipments",
    label: "Courier Logistics",
    icon: FaTruck,
  },
  {
    href: "/admin/products",
    label: "Products Catalog",
    icon: FaTags,
  },
  {
    href: "/admin/vouchers",
    label: "Vouchers & Loyalty",
    icon: FaGift,
  },
  {
    href: "/admin/refunds",
    label: "Refund Requests",
    icon: FaUndoAlt,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hatkhola_admin_token");
      window.location.href = "/";
    }
  };

  return (
    <aside
      id="hatkhola-admin-sidebar"
      className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0 h-screen sticky top-0 select-none z-30"
    >
      {/* Brand & Console Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-base tracking-tighter">HB</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              Hatkhola Bazar
            </h1>
            <p className="text-[11px] font-medium text-orange-600">
              Operations Console
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Management
        </div>

        {NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-orange-50 text-orange-700 shadow-xs border border-orange-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent"
              }`}
            >
              <Icon
                className={`text-sm shrink-0 ${
                  isActive ? "text-orange-600" : "text-slate-400"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-5 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Store Link
        </div>

        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <span className="truncate">Public Storefront</span>
          <FaExternalLinkAlt className="text-[10px] text-slate-400" />
        </Link>
      </nav>

      {/* System Integrity & Sign Out */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 mb-3 px-1 text-[11px] text-emerald-700 font-medium">
          <FaCheckCircle className="text-emerald-500 text-xs shrink-0" />
          <span>ACID Mongo Trans. Active</span>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/60 transition-colors"
        >
          <FaSignOutAlt className="text-xs" />
          <span>Exit Console</span>
        </button>
      </div>
    </aside>
  );
}

