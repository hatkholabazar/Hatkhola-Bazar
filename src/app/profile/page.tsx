"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaMapMarkerAlt,
  FaSave,
  FaArrowLeft,
  FaCheckCircle,
  FaTruck,
  FaBoxOpen,
  FaShoppingBag,
  FaUndoAlt,
  FaInfoCircle,
  FaTimes,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaCalendarAlt,
  FaShieldAlt,
  FaCamera,
  FaSignOutAlt,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { authClient } from "@/lib/auth-client";

interface CustomerProfileData {
  name: string;
  phone: string;
  district: string;
  address: string;
  paymentMethod: "COD" | "bKash" | "Nagad";
  notes: string;
}

interface SavedOrder {
  orderId: string;
  createdAt: string;
  customer: { name: string; phone: string; address: string; notes?: string };
  deliveryArea: string;
  deliveryCharge: number;
  items: { id: string; name: string; option: string; price: number; quantity: number }[];
  subtotal: number;
  grandTotal: number;
  paymentMethod: string;
  paymentDetails?: {
    senderNumber?: string;
    trxId?: string;
  };
  status: string;
  refundRequest?: {
    reason: string;
    notes?: string;
    images?: string[];
    requestedAt?: string;
  };
}

const DEFAULT_PROFILE: CustomerProfileData = {
  name: "",
  phone: "",
  district: "Inside Chittagong",
  address: "",
  paymentMethod: "COD",
  notes: "",
};

export default function CustomerProfilePage() {
  const { business } = siteConfig;
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [activeTab, setActiveTab] = useState<"orders" | "settings">("orders");
  const [profile, setProfile] = useState<CustomerProfileData>(DEFAULT_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  // Route protection: redirect unauthenticated visitors
  useEffect(() => {
    if (!sessionPending && !session?.user) {
      router.push("/sign-in?redirect=/profile");
    }
  }, [session, sessionPending, router]);

  // Sync profile with session user
  useEffect(() => {
    if (session?.user?.name) {
      setProfile((prev) => ({
        ...prev,
        name: session.user.name || prev.name,
      }));
    }
  }, [session]);

  // Modals state
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<SavedOrder | null>(null);
  const [refundTargetOrder, setRefundTargetOrder] = useState<SavedOrder | null>(null);
  const [refundReason, setRefundReason] = useState("Damaged / Broken packaging during transit");
  const [refundNotes, setRefundNotes] = useState("");
  const [refundImages, setRefundImages] = useState<string[]>([]);
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 4 - refundImages.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setRefundImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setRefundImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Load profile and real orders from backend & localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hatkhola_customer_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile((prev) => ({
          ...DEFAULT_PROFILE,
          ...parsed,
          name: session?.user?.name || parsed.name || "",
        }));
      } else if (session?.user?.name) {
        setProfile((prev) => ({
          ...DEFAULT_PROFILE,
          name: session.user.name,
        }));
      }
    } catch {
      setProfile(DEFAULT_PROFILE);
    }
  }, [session]);

  // Fetch real orders from database
  useEffect(() => {
    if (!session?.user) return;

    const fetchRealOrders = async () => {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";

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

        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.orders)) {
            const mapped: SavedOrder[] = data.orders.map((o: any) => ({
              orderId: o.orderNo || o.id,
              createdAt: o.createdAt,
              customer: {
                name: session?.user?.name || profile.name || "Customer",
                phone: profile.phone || "",
                address: profile.address || "",
              },
              deliveryArea: "Standard Courier",
              deliveryCharge: 60,
              items: (o.items || []).map((it: any) => ({
                id: it.productName,
                name: it.productName,
                option: it.optionLabel,
                price: it.sellingPrice,
                quantity: Math.max(1, Math.round((it.qtyG || 1000) / 1000)),
              })),
              subtotal: o.totalAmount,
              grandTotal: o.totalAmount,
              paymentMethod: o.paymentMethod || "COD",
              status: o.statusLabel?.en || o.status || "Processing",
            }));
            setOrders(mapped);
            return;
          }
        }
      } catch {
        // Fallback to local storage if offline
      }

      try {
        const storedOrders = localStorage.getItem("hatkhola_orders");
        if (storedOrders) {
          const parsed = JSON.parse(storedOrders);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(parsed);
            return;
          }
        }
      } catch {
        // Ignore
      }
      setOrders([]);
    };

    fetchRealOrders();
  }, [session, profile.name, profile.phone, profile.address]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("hatkhola_customer_profile", JSON.stringify(profile));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      alert("Failed to save profile information.");
    }
  };

  const handleOpenRefundModal = (order: SavedOrder) => {
    setRefundTargetOrder(order);
    setRefundReason("Damaged / Broken packaging during transit");
    setRefundNotes("");
    setRefundImages([]);
    setRefundSuccessMsg("");
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTargetOrder) return;

    setIsSubmittingRefund(true);

    try {
      // 1. Update local storage
      const updatedOrders = orders.map((o) => {
        if (o.orderId === refundTargetOrder.orderId) {
          return {
            ...o,
            status: "Refund Requested",
            refundRequest: {
              reason: refundReason,
              notes: refundNotes,
              images: refundImages,
              requestedAt: new Date().toISOString(),
            },
          };
        }
        return o;
      });

      setOrders(updatedOrders);
      localStorage.setItem("hatkhola_orders", JSON.stringify(updatedOrders));

      // 2. Call API endpoint
      await fetch(`/api/orders/${refundTargetOrder.orderId}/refund`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: refundReason,
          notes: refundNotes,
          images: refundImages,
          phone: refundTargetOrder.customer.phone,
        }),
      });

      setRefundSuccessMsg(
        `Refund request for order ${refundTargetOrder.orderId} submitted successfully. Our team will review and process your refund within 24-48 hours.`
      );
      setTimeout(() => {
        setRefundTargetOrder(null);
        setRefundSuccessMsg("");
      }, 3500);
    } catch {
      alert("Failed to process refund. Please contact our helpline directly.");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  if (sessionPending) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-24">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
          <div className="h-6 w-32 bg-orange-100 rounded-lg mb-6" />
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-3xl bg-orange-100 mb-3" />
            <div className="h-8 w-56 bg-orange-200/60 rounded-xl mb-2" />
            <div className="h-4 w-72 bg-orange-100 rounded-lg" />
          </div>
          <div className="h-64 bg-white rounded-3xl border border-orange-200/60" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-24">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition whitespace-nowrap"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/refund-policy"
              className="text-xs font-bold text-slate-500 hover:text-primary transition whitespace-nowrap"
            >
              Refund Policy
            </Link>
            <button
              type="button"
              onClick={async () => {
                document.cookie =
                  "hatkhola_admin_token=; path=/; max-age=0; SameSite=Lax";
                try {
                  localStorage.removeItem("hatkhola_admin_token");
                } catch {
                  // Ignore storage errors
                }
                await authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                      router.refresh();
                    },
                  },
                });
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <FaSignOutAlt className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
        {/* Profile Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="w-16 h-16 rounded-3xl bg-orange-100 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
            <FaUser className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {profile.name ? `Welcome, ${profile.name}` : "Customer Dashboard"}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800 uppercase tracking-wide">
              Role: {session?.user?.role || "user"}
            </span>
          </div>
          {session?.user?.role === "admin" && (
            <div className="mt-3">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-300 bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-extrabold transition shadow-2xs"
              >
                <span>Go to Admin Dashboard</span>
              </Link>
            </div>
          )}
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Manage your past online orders, request refunds, and maintain your saved delivery address.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-2xl bg-orange-100/70 border border-orange-200">
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`py-2 px-3.5 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                activeTab === "orders"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaBoxOpen className="w-4 h-4 shrink-0" />
              <span>Order History</span>
              {orders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-primary text-white text-3xs font-mono font-bold">
                  {orders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={`py-2 px-3.5 sm:px-5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 sm:gap-2 ${
                activeTab === "settings"
                  ? "bg-white text-primary shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FaMapMarkerAlt className="w-4 h-4 shrink-0" />
              <span>Saved Address</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
            <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your delivery profile was saved successfully!</span>
          </div>
        )}

        {/* TAB 1: ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <FaBoxOpen className="text-primary w-5 h-5" />
                <span>Your Order History</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {orders.length} order(s) found
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-3xl bg-white border border-orange-200/80 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-300 flex items-center justify-center mx-auto mb-3">
                  <FaShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No Orders Placed Yet
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                  When you complete an order on our checkout page, it will appear here with full tracking and refund options.
                </p>
                <Link
                  href="/#products"
                  className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition"
                >
                  <FaShoppingBag className="w-3.5 h-3.5" />
                  <span>Browse Artisanal Collection</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs hover:border-orange-300 transition"
                  >
                    {/* Top Row: ID, Date, Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900 font-mono text-primary">
                          {ord.orderId}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-3xs sm:text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <FaCalendarAlt className="w-3 h-3 text-slate-400" />
                          {new Date(ord.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-3xs sm:text-xs font-black uppercase tracking-wider ${
                          ord.status === "Refund Requested"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : ord.status === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    {/* Middle: Items Summary */}
                    <div className="py-3.5 space-y-2 text-xs text-slate-700">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="font-medium">
                            {it.name}{" "}
                            <span className="text-primary font-bold">
                              ({it.option})
                            </span>{" "}
                            × {it.quantity}
                          </span>
                          <span className="font-black text-slate-900 font-sans">
                            ৳ {it.price * it.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom: Total & Action Buttons (Details + Refund) */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs">
                        <span className="text-slate-500 font-medium">
                          Payment:{" "}
                          <strong className="text-slate-800">
                            {ord.paymentMethod === "COD" ? "Cash on Delivery" : ord.paymentMethod}
                          </strong>
                        </span>
                        <span className="mx-2 text-slate-300">•</span>
                        <span className="text-slate-500 font-medium">
                          Total:{" "}
                          <strong className="text-sm font-black text-primary font-sans">
                            ৳ {ord.grandTotal}
                          </strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* DETAILS BUTTON */}
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-950 font-extrabold text-xs whitespace-nowrap border border-orange-200 transition cursor-pointer"
                        >
                          <FaInfoCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                          <span>Details</span>
                        </button>

                        {/* REFUND BUTTON */}
                        {ord.status !== "Refund Requested" ? (
                          <button
                            type="button"
                            onClick={() => handleOpenRefundModal(ord)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-extrabold text-xs whitespace-nowrap border border-rose-200 transition cursor-pointer"
                          >
                            <FaUndoAlt className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Refund</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-3xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 whitespace-nowrap">
                            <FaShieldAlt className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Refund in Review</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED ADDRESS & SETTINGS */}
        {activeTab === "settings" && (
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-md p-6 sm:p-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 mb-4 pb-2 border-b border-orange-100 flex items-center gap-2">
              <FaMapMarkerAlt className="text-primary w-4 h-4" />
              <span>Customer Information & Delivery Address</span>
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="e.g. Abdullah Al Mamun"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="e.g. +880 18XXXXXXXX"
                    className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Default Delivery Region
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {["Inside Chittagong", "Outside Chittagong"].map((region) => (
                    <button
                      key={region}
                      type="button"
                      onClick={() => setProfile({ ...profile, district: region })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition ${
                        profile.district === region
                          ? "border-primary bg-orange-50 text-orange-950 ring-1 ring-primary"
                          : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"
                      }`}
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Delivery Address
                </label>
                <textarea
                  rows={2}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="e.g. House #24, Road #3, GEC Circle, Chattogram"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Special Delivery Instructions
                </label>
                <input
                  type="text"
                  value={profile.notes}
                  onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                  placeholder="e.g. Call before arrival or leave with security"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md transition cursor-pointer"
                >
                  <FaSave className="w-4 h-4 shrink-0" />
                  <span>Update Profile Information</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: ORDER DETAILS MODAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-orange-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-orange-100 flex items-center justify-between bg-orange-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-primary flex items-center justify-center">
                  <FaInfoCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Order Details: {selectedOrderDetails.orderId}
                  </h3>
                  <span className="text-3xs text-slate-500">
                    Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              {/* Delivery Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="text-3xs font-extrabold uppercase tracking-wider text-slate-500">
                  Delivery Recipient & Destination
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Recipient Name:</span>
                    <p className="font-bold text-slate-900">{selectedOrderDetails.customer.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Phone:</span>
                    <p className="font-bold text-slate-900">{selectedOrderDetails.customer.phone}</p>
                  </div>
                </div>
                <div className="text-xs pt-1">
                  <span className="text-slate-500">Full Delivery Address:</span>
                  <p className="font-bold text-slate-900">{selectedOrderDetails.customer.address}</p>
                </div>
                <div className="text-xs pt-1 flex justify-between">
                  <span className="text-slate-500">Destination:</span>
                  <span className="font-extrabold text-primary">{selectedOrderDetails.deliveryArea}</span>
                </div>
                {selectedOrderDetails.customer.notes && (
                  <div className="text-xs pt-1">
                    <span className="text-slate-500">Special Instructions:</span>
                    <p className="font-medium text-slate-800">{selectedOrderDetails.customer.notes}</p>
                  </div>
                )}
              </div>

              {/* Items Breakdown */}
              <div>
                <h4 className="text-3xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Purchased Products
                </h4>
                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/70 p-3 bg-white">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="py-2 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-slate-900">{it.name}</span>
                        <span className="block text-3xs text-primary font-semibold">
                          {it.option} × {it.quantity}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 font-sans">
                        ৳ {it.price * it.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Payment Mode:</span>
                  <span className="font-bold text-slate-900">
                    {selectedOrderDetails.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : selectedOrderDetails.paymentMethod}
                  </span>
                </div>

                {selectedOrderDetails.paymentDetails?.senderNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Sender Number:</span>
                    <span className="font-bold font-mono text-slate-900">
                      {selectedOrderDetails.paymentDetails.senderNumber}
                    </span>
                  </div>
                )}

                {selectedOrderDetails.paymentDetails?.trxId && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Transaction ID (TrxID):</span>
                    <span className="font-bold font-mono text-primary uppercase">
                      {selectedOrderDetails.paymentDetails.trxId}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Fee:</span>
                  <span className="font-bold font-sans text-slate-900">
                    ৳ {selectedOrderDetails.deliveryCharge}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-orange-200 text-sm font-black text-slate-900">
                  <span>Total Paid / Payable:</span>
                  <span className="text-primary font-sans text-base">
                    ৳ {selectedOrderDetails.grandTotal}
                  </span>
                </div>
              </div>

              {/* Refund Request Info if present */}
              {selectedOrderDetails.refundRequest && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs font-extrabold uppercase tracking-wider text-amber-900">
                      Refund / Replacement Request
                    </span>
                    <span className="text-3xs text-amber-700 font-semibold">
                      {selectedOrderDetails.refundRequest.requestedAt
                        ? new Date(selectedOrderDetails.refundRequest.requestedAt).toLocaleDateString()
                        : "Pending Review"}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Reason: <span className="font-normal text-slate-700">{selectedOrderDetails.refundRequest.reason}</span>
                  </p>
                  {selectedOrderDetails.refundRequest.notes && (
                    <p className="text-xs text-slate-600">
                      Notes: {selectedOrderDetails.refundRequest.notes}
                    </p>
                  )}
                  {selectedOrderDetails.refundRequest.images && selectedOrderDetails.refundRequest.images.length > 0 && (
                    <div className="pt-2">
                      <span className="text-3xs font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Uploaded Product Photos ({selectedOrderDetails.refundRequest.images.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrderDetails.refundRequest.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shadow-2xs"
                          >
                            <img
                              src={img}
                              alt={`Proof ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="py-2 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs whitespace-nowrap transition cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REFUND REQUEST MODAL */}
      {refundTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/60 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <FaUndoAlt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    Request Refund for {refundTargetOrder.orderId}
                  </h3>
                  <span className="text-3xs text-slate-500">
                    Guaranteed within 24-48 hours as per Hatkhola Bazar Policy
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRefundTargetOrder(null)}
                className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Form */}
            {refundSuccessMsg ? (
              <div className="p-6 text-center space-y-4 overflow-y-auto">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <FaCheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-slate-900">
                  Refund Request Submitted
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {refundSuccessMsg}
                </p>
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-3xs text-slate-700">
                  Helpline support: <strong>{business.phone}</strong>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitRefund} className="p-6 space-y-4 text-xs sm:text-sm overflow-y-auto">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Order Reference
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${refundTargetOrder.orderId} (৳ ${refundTargetOrder.grandTotal})`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reason for Refund <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900 font-medium text-xs"
                  >
                    <option value="Damaged / Broken packaging during transit">
                      Damaged / Broken packaging during transit
                    </option>
                    <option value="Wrong product or jar size delivered">
                      Wrong product or jar size delivered
                    </option>
                    <option value="Texture or quality dissatisfaction">
                      Texture or quality dissatisfaction
                    </option>
                    <option value="Delivery was severely delayed">
                      Delivery was severely delayed
                    </option>
                    <option value="Other reason">
                      Other reason
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Details / Explanation
                  </label>
                  <textarea
                    rows={3}
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    placeholder="Please briefly describe the issue so our artisanal QC team can resolve it immediately..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900 text-xs"
                  />
                </div>

                {/* Upload Product Picture */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Product Picture / Proof of Damage <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <span className="text-3xs text-slate-400 font-medium">
                      {refundImages.length}/4 uploaded
                    </span>
                  </div>

                  {/* Thumbnail Previews */}
                  {refundImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {refundImages.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-2xs group"
                        >
                          <img
                            src={img}
                            alt={`Product damage proof ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            aria-label="Remove photo"
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                          >
                            <FaTimes className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Drop Area */}
                  {refundImages.length < 4 && (
                    <label className="border-2 border-dashed border-orange-200 hover:border-primary/80 hover:bg-orange-50/40 rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center cursor-pointer transition group">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-primary flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                        <FaCamera className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
                        Click to upload product picture
                      </span>
                      <span className="text-3xs text-slate-400 mt-0.5">
                        Upload clear photos of broken seal, leak, or defect (max 5MB)
                      </span>
                    </label>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-3xs text-amber-900 flex items-center gap-2">
                  <FaShieldAlt className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Our policy guarantees a 100% money-back or instant replacement for any defect or damage.
                  </span>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRefundTargetOrder(null)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs whitespace-nowrap hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingRefund}
                    className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs whitespace-nowrap shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmittingRefund ? "Submitting..." : "Submit Refund Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
