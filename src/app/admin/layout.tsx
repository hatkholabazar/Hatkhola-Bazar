import type { Metadata } from "next";
import Link from "next/link";
import { FaExternalLinkAlt } from "react-icons/fa";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminMobileBottomBar from "@/components/admin/AdminMobileBottomBar";
import AdminGuard from "@/components/admin/AdminGuard";

export const metadata: Metadata = {
  title: "Hatkhola Bazar | Operations Console",
  description: "Private operations console for stock, costing, and sales finance.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="h-screen w-full bg-slate-50 text-slate-800 flex flex-col md:flex-row overflow-hidden antialiased">
        {/* Mobile Top Brand Bar (< md viewports) */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-xs font-black text-xs">
              HB
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 block leading-tight">
                Hatkhola Bazar
              </span>
              <span className="text-[10px] font-bold text-orange-600 block leading-tight">
                Operations Console
              </span>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-950 font-bold text-[11px] border border-orange-200 flex items-center gap-1 transition"
          >
            <span>Storefront</span>
            <FaExternalLinkAlt className="w-2.5 h-2.5" />
          </Link>
        </header>

        {/* Desktop Vertical Sidebar (>= md viewports) */}
        <AdminSidebar />

        {/* Main Content Area (safe padding for mobile bottom bar) */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (< md viewports) */}
        <AdminMobileBottomBar />
      </div>
    </AdminGuard>
  );
}
