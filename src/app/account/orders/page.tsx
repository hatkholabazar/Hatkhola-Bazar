"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaBoxOpen,
  FaArrowLeft,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTruck,
  FaUndoAlt,
  FaRedoAlt,
  FaSpinner,
  FaUser,
} from "react-icons/fa";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import InvoiceDownloadButton from "@/components/invoice/InvoiceDownloadButton";
import type { InvoiceOrderData } from "@/components/invoice/OrderInvoicePdf";

interface CustomerOrder {
  id: string;
  orderNo: string;
  orderType: "sale" | "preorder";
  createdAt: string;
  items: {
    productName: string;
    optionLabel: string;
    qtyG: number;
    sellingPrice: number;
    quantity?: number;
    price?: number;
  }[];
  totalAmount: number;
  paymentMethod: string;
  status: string;
  statusLabel?: {
    en: string;
    bn: string;
  };
}

function mapOrderToInvoice(ord: CustomerOrder, sessionUser?: any): InvoiceOrderData {
  return {
    orderId: ord.orderNo || ord.id,
    createdAt: ord.createdAt,
    customerName: sessionUser?.name || "Valued Customer",
    customerPhone: sessionUser?.phone || "",
    customerAddress: sessionUser?.address || "Registered Address",
    items: (ord.items || []).map((it) => ({
      name: it.productName,
      option: it.optionLabel || (it.qtyG ? `${it.qtyG}g` : undefined),
      qtyG: it.qtyG,
      price: it.price || it.sellingPrice,
      quantity: it.quantity || 1,
      isPreOrder: ord.orderType === "preorder",
    })),
    subtotal: ord.totalAmount,
    grandTotal: ord.totalAmount,
    paymentMethod: ord.paymentMethod,
    isPreOrder: ord.orderType === "preorder",
    preOrderNote:
      ord.orderType === "preorder"
        ? "Winter Harvest Batch (Mid-December)"
        : undefined,
  };
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    try {
      const headers: Record<string, string> = {};
      const token = (session as any)?.session?.token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["x-session-token"] = token;
      }

      const res = await fetch(`${backendUrl}/api/account/orders`, {
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 401) {
          if (!session?.user) {
            router.push("/sign-in?redirect=/account/orders");
            return;
          }
        }
        throw new Error("Failed to load your orders");
      }

      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      const msg = err.message || "Failed to load orders. Please try again.";
      setError(msg);
      toast.error(msg, { id: "account-orders-err" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push("/sign-in?redirect=/account/orders");
    } else if (session?.user) {
      fetchOrders();
    }
  }, [session, sessionPending]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-orange-50/20 pb-20 pt-6 sm:pt-10">
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition whitespace-nowrap"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-100 text-primary flex items-center justify-center shrink-0 shadow-xs">
                <FaBoxOpen className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  My Orders
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  View your confirmed orders, delivery progress, and purchase records
                </p>
              </div>
            </div>

            {/* Link to Profile Settings */}
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 text-xs font-bold transition shadow-2xs"
            >
              <FaUser className="w-3.5 h-3.5 text-primary" />
              <span>Profile & Delivery Settings</span>
            </Link>
          </div>
        </div>

        {/* Orders Content */}
        {loading || sessionPending ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-white rounded-2xl border border-slate-200 shadow-xs animate-pulse p-6"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-white border border-red-200 text-center space-y-4 shadow-sm">
            <p className="text-sm font-semibold text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-xs transition"
            >
              <FaRedoAlt className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-white border border-orange-100 shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-300 flex items-center justify-center mx-auto mb-3">
              <FaShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              You haven&apos;t placed any orders yet. Explore our handcrafted village goods and place your first order.
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition"
            >
              <FaShoppingBag className="w-3.5 h-3.5" />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 transition hover:border-orange-200 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {ord.orderNo}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ord.orderType === "sale"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {ord.orderType === "sale" ? "Direct Order" : "Pre-order"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {new Date(ord.createdAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-50 text-primary border border-orange-200">
                      {ord.statusLabel?.en || ord.status}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="space-y-1.5 pt-1">
                  {ord.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-700"
                    >
                      <span>
                        <strong className="text-slate-900">{it.productName}</strong>
                        {it.optionLabel && (
                          <span className="text-slate-500"> ({it.optionLabel})</span>
                        )}
                        {(it.quantity || 1) > 1 && (
                          <span className="text-primary font-bold"> × {it.quantity}</span>
                        )}
                      </span>
                      <span className="font-mono font-semibold">
                        ৳ {((it.price || it.sellingPrice || 0) * (it.quantity || 1))?.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Total & Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 uppercase text-[10px] tracking-wider">
                      Payment: {ord.paymentMethod}
                    </span>
                    <span className="text-slate-300">•</span>
                    <div className="text-sm text-slate-900">
                      Total: <span className="font-mono text-primary">৳ {ord.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <InvoiceDownloadButton
                    order={mapOrderToInvoice(ord, session?.user)}
                    variant="secondary"
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

