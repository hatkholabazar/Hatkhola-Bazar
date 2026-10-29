import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
    <div className="h-screen w-full bg-slate-50 text-slate-800 flex flex-col md:flex-row overflow-hidden antialiased">
      <AdminSidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
