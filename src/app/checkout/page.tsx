"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaShoppingBag,
  FaTruck,
  FaUser,
  FaLock,
  FaMoneyBillWave,
  FaShieldAlt,
  FaCheckCircle,
  FaCopy,
  FaCheck,
  FaEye,
  FaEyeSlash,
  FaExclamationCircle,
  FaSignOutAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import PathaoLocationPicker, {
  PathaoLocationValue,
} from "@/components/admin/PathaoLocationPicker";
import { VoucherSection } from "@/components/checkout/VoucherSection";
import { loyaltyApi, IVoucher, IVoucherEvaluationResult } from "@/lib/loyalty-api";
import { formatTaka } from "@/config/admin-labels";
import InvoiceDownloadButton from "@/components/invoice/InvoiceDownloadButton";
import type { InvoiceOrderData } from "@/components/invoice/OrderInvoicePdf";

function parseOptionGrams(option: string): number {
  const lower = (option || "").toLowerCase();
  if (lower.includes("5 kg") || lower.includes("5kg")) return 5000;
  if (lower.includes("2 kg") || lower.includes("2kg")) return 2000;
  if (lower.includes("1 kg") || lower.includes("1kg") || lower.includes("১ কেজি")) return 1000;
  if (lower.includes("500 g") || lower.includes("500g") || lower.includes("৫০০ গ্রাম")) return 500;
  if (lower.includes("250 g") || lower.includes("250g") || lower.includes("২৫০ গ্রাম")) return 250;
  const match = lower.match(/(\d+)\s*g/);
  if (match) return parseInt(match[1], 10);
  return 1000;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { business } = siteConfig;
  const { items, subtotal, totalCount, clearCart } = useCart();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  // Stable idempotency key per checkout attempt
  const idempotencyKeyRef = useRef<string>("");
  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `hb-idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
  }, []);

  // Form Field Refs for error focusing
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const addressInputRef = useRef<HTMLTextAreaElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);
  const termsCheckboxRef = useRef<HTMLInputElement>(null);
  const senderNumberRef = useRef<HTMLInputElement>(null);
  const trxIdRef = useRef<HTMLInputElement>(null);

  // Form State
  const [deliveryArea, setDeliveryArea] = useState<"ctg" | "outside">("ctg");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Pathao Location Cascade State
  const [pathaoLocation, setPathaoLocation] = useState<PathaoLocationValue>({
    isValid: false,
  });

  // Guest Account creation fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "bKash" | "Nagad">("COD");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Status & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailExistsAlert, setEmailExistsAlert] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<InvoiceOrderData | null>(null);

  // Voucher state
  const [appliedVoucher, setAppliedVoucher] = useState<IVoucherEvaluationResult | null>(null);
  const [customerVouchers, setCustomerVouchers] = useState<IVoucher[]>([]);

  // Delivery charge calculation: Inside Ctg = 60 tk, Outside Ctg = 120 tk
  const deliveryCharge = deliveryArea === "ctg" ? 60 : 120;
  const discountTotal = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const payableSubtotal = Math.max(0, subtotal - discountTotal);
  const grandTotal = payableSubtotal + (items.length > 0 ? deliveryCharge : 0);

  // Load customer active vouchers if logged in or phone supplied
  useEffect(() => {
    let isCancelled = false;
    async function loadVouchers() {
      try {
        const vList = await loyaltyApi.getCustomerVouchers(phone || undefined, "active");
        if (!isCancelled) setCustomerVouchers(vList);
      } catch {
        // Ignore guest errors
      }
    }
    loadVouchers();
    return () => {
      isCancelled = true;
    };
  }, [phone, session]);

  // Prefill details from session or draft
  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) setName(session.user.name);
      if (session.user.email && !email) setEmail(session.user.email);
    }
  }, [session]);

  // Load draft from sessionStorage or localStorage
  useEffect(() => {
    try {
      const draft = sessionStorage.getItem("hatkhola_checkout_draft");
      if (draft) {
        const p = JSON.parse(draft);
        if (p.name) setName(p.name);
        if (p.email) setEmail(p.email);
        if (p.phone) setPhone(p.phone);
        if (p.address) setAddress(p.address);
        if (p.notes) setNotes(p.notes);
        if (p.deliveryArea) setDeliveryArea(p.deliveryArea);
      } else {
        const stored = localStorage.getItem("hatkhola_customer_profile");
        if (stored) {
          const p = JSON.parse(stored);
          if (p.name) setName(p.name);
          if (p.phone) setPhone(p.phone);
          if (p.address) setAddress(p.address);
          if (p.district === "Outside Ctg") setDeliveryArea("outside");
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleCopyPaymentNumber = () => {
    navigator.clipboard.writeText(business.phone);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.info("Signed out successfully", { id: "signout-toast" });
            router.refresh();
          },
        },
      });
    } catch {
      toast.error("Failed to sign out", { id: "signout-err" });
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailExistsAlert(false);

    // Honeypot check
    if (honeypot && honeypot.trim().length > 0) {
      return;
    }

    // 1. Validation Checks
    if (!name.trim() || name.trim().length < 3) {
      toast.error("Full name must be at least 3 characters", { id: "checkout-val" });
      nameInputRef.current?.focus();
      return;
    }

    const cleanPhone = phone.replace(/[\s\-()]/g, "");
    const normalizedPhone = cleanPhone.startsWith("+880")
      ? "0" + cleanPhone.slice(4)
      : cleanPhone.startsWith("880")
      ? "0" + cleanPhone.slice(3)
      : cleanPhone;

    if (!/^01[3-9]\d{8}$/.test(normalizedPhone)) {
      toast.error("Valid Bangladesh mobile number required (01XXXXXXXXX)", {
        id: "checkout-val",
      });
      phoneInputRef.current?.focus();
      return;
    }

    if (!address.trim() || address.trim().length < 10) {
      toast.error("Delivery address must be between 10 and 220 characters", {
        id: "checkout-val",
      });
      addressInputRef.current?.focus();
      return;
    }

    // Guest Authentication Validation
    const isGuest = !session?.user;
    if (isGuest) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        toast.error("Valid email address is required for your customer account", {
          id: "checkout-val",
        });
        emailInputRef.current?.focus();
        return;
      }

      if (!password || password.length < 8) {
        toast.error("Password must be at least 8 characters long", { id: "checkout-val" });
        passwordInputRef.current?.focus();
        return;
      }

      if (password !== confirmPassword) {
        toast.error("Password and Confirm Password do not match", { id: "checkout-val" });
        confirmPasswordInputRef.current?.focus();
        return;
      }

      if (!agreedToTerms) {
        toast.error("Please agree to the Terms and Privacy Policy to proceed", {
          id: "checkout-val",
        });
        termsCheckboxRef.current?.focus();
        return;
      }
    }

    // Payment validation
    if (paymentMethod === "bKash" || paymentMethod === "Nagad") {
      if (!senderNumber.trim()) {
        toast.error(`Please provide your ${paymentMethod} sender number`, {
          id: "checkout-val",
        });
        senderNumberRef.current?.focus();
        return;
      }
      if (!trxId.trim()) {
        toast.error(`Please provide the Transaction ID (TrxID) from ${paymentMethod}`, {
          id: "checkout-val",
        });
        trxIdRef.current?.focus();
        return;
      }
    }

    if (items.length === 0) {
      toast.error("Your cart is empty. Please add products before checking out.", {
        id: "checkout-val",
      });
      return;
    }

    setIsSubmitting(true);

    // 2. If Guest: Auto Sign Up with Better Auth
    if (isGuest) {
      try {
        const signUpResult = await authClient.signUp.email({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
        });

        if (signUpResult.error) {
          const errMsg = signUpResult.error.message || "Account registration failed";
          const lower = errMsg.toLowerCase();

          if (
            lower.includes("already exists") ||
            lower.includes("user already exists") ||
            lower.includes("email already in use") ||
            lower.includes("duplicate")
          ) {
            // Save draft in sessionStorage without password
            try {
              sessionStorage.setItem(
                "hatkhola_checkout_draft",
                JSON.stringify({
                  name: name.trim(),
                  email: email.trim(),
                  phone: normalizedPhone,
                  address: address.trim(),
                  deliveryArea,
                  notes: notes.trim(),
                  paymentMethod,
                })
              );
            } catch {
              // Ignore storage errors
            }

            setEmailExistsAlert(true);
            toast.warning(
              "An account with this email already exists. Please sign in to proceed.",
              { id: "checkout-auth" }
            );
            setIsSubmitting(false);
            return;
          }

          toast.error(errMsg, { id: "checkout-auth" });
          setIsSubmitting(false);
          return;
        }
      } catch (authErr: any) {
        toast.error(authErr.message || "Failed to create account. Please try again.", {
          id: "checkout-auth",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // 3. Submit Order to Backend API
    const toastId = toast.loading("Placing your order...", { id: "order-placement" });
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const payload = {
      fullName: name.trim(),
      phone: normalizedPhone,
      address: address.trim(),
      cityId: pathaoLocation.cityId,
      cityName: pathaoLocation.cityName,
      zoneId: pathaoLocation.zoneId,
      zoneName: pathaoLocation.zoneName,
      areaId: pathaoLocation.areaId,
      areaName: pathaoLocation.areaName,
      deliveryArea,
      items: items.map((it) => ({
        productId: it.productId || it.id,
        optionLabel: it.option || it.name,
        qtyG: parseOptionGrams(it.option),
        quantity: it.quantity,
      })),
      voucherCode: appliedVoucher?.code || undefined,
      paymentMethod:
        paymentMethod === "COD"
          ? "cod"
          : paymentMethod === "bKash"
          ? "bkash"
          : "nagad",
      senderNumber: senderNumber.trim() || undefined,
      trxId: trxId.trim() || undefined,
      notes: notes.trim() || undefined,
      idempotencyKey: idempotencyKeyRef.current,
      website: honeypot,
    };

    try {
      const response = await fetch(`${backendUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorText = data.error || data.message || "Failed to place order";
        toast.error(errorText, { id: toastId });
        setIsSubmitting(false);
        return;
      }

      // Order Success!
      toast.success(`Order #${data.orderId} placed successfully!`, { id: toastId });

      // Prepare complete invoice data before clearing cart
      const isPreOrderCart =
        items.some((it: any) => Boolean(it.isPreOrder)) ||
        Boolean(data.orderId && String(data.orderId).startsWith("PO-"));

      const invoiceData: InvoiceOrderData = {
        orderId: data.orderId || "HB-ORDER",
        createdAt: new Date().toISOString(),
        customerName: name.trim(),
        customerPhone: normalizedPhone,
        customerAddress: address.trim(),
        customerNotes: notes.trim() || undefined,
        deliveryArea: deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong",
        deliveryCharge: items.length > 0 ? deliveryCharge : 0,
        items: items.map((it: any) => ({
          name: it.name,
          option: it.option || it.weight || undefined,
          qtyG: parseOptionGrams(it.option),
          price: it.price,
          quantity: it.quantity,
          isPreOrder: Boolean(it.isPreOrder),
        })),
        subtotal,
        voucherDiscount: discountTotal > 0 ? discountTotal : undefined,
        voucherCode: appliedVoucher?.code || undefined,
        grandTotal: data.total || grandTotal,
        paymentMethod:
          paymentMethod === "COD"
            ? "Cash on Delivery"
            : `${paymentMethod} (TrxID: ${trxId.trim()})`,
        isPreOrder: isPreOrderCart,
        preOrderNote: isPreOrderCart ? "Winter Harvest Batch (Mid-December)" : undefined,
      };

      // Clean up cart and draft
      clearCart();
      try {
        sessionStorage.removeItem("hatkhola_checkout_draft");
        localStorage.setItem(
          "hatkhola_customer_profile",
          JSON.stringify({
            name: name.trim(),
            phone: normalizedPhone,
            address: address.trim(),
            district: deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong",
            notes: notes.trim(),
            isRegistered: true,
            lastOrderAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore storage errors
      }

      setPlacedOrder(invoiceData);

      setIsSubmitting(false);
    } catch (orderErr: any) {
      toast.error(
        orderErr.message || "Network error. Please try clicking Confirm Order again.",
        { id: toastId }
      );
      setIsSubmitting(false);
    }
  };

  // Skeleton view during session check to prevent layout shift
  if (sessionPending) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-24">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
          <div className="h-6 w-36 bg-orange-100 rounded-lg mb-8" />
          <div className="h-10 w-64 bg-orange-200/60 rounded-xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="h-44 bg-white rounded-3xl border border-orange-200/60" />
              <div className="h-64 bg-white rounded-3xl border border-orange-200/60" />
              <div className="h-48 bg-white rounded-3xl border border-orange-200/60" />
            </div>
            <div className="lg:col-span-5">
              <div className="h-96 bg-white rounded-3xl border border-orange-200/60" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 pb-24">
      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-primary transition whitespace-nowrap"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Continue Shopping</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] sm:text-xs font-bold whitespace-nowrap">
            <FaShieldAlt className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">100% Encrypted & Secure Checkout</span>
            <span className="sm:hidden">100% Secure</span>
          </div>
        </div>

        {/* ORDER SUCCESS VIEW */}
        {placedOrder ? (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <FaCheckCircle className="w-12 h-12" />
            </div>

            <span className="inline-block text-xs uppercase tracking-widest font-black text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-200 mb-3">
              Order Confirmed & Placed
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Thank You, {placedOrder.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your order has been recorded directly on our system. We will pack your fresh artisanal batch right away and deliver to your address.
            </p>

            {/* Receipt Card */}
            <div className="mt-8 p-6 sm:p-8 rounded-3xl bg-white border border-orange-200/90 shadow-md text-left space-y-3.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Order Reference:</span>
                <span className="font-black font-mono text-sm sm:text-base text-primary">
                  {placedOrder.orderId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Items Count:</span>
                <span className="font-bold text-slate-800">
                  {placedOrder.items?.reduce((acc, i) => acc + i.quantity, 0) || placedOrder.items?.length || 1} item(s)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delivery Destination:</span>
                <span className="font-bold text-slate-800">{placedOrder.deliveryArea || "Chittagong"}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-slate-800">{placedOrder.customerPhone}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delivery Address:</span>
                <span className="font-bold text-slate-800 text-right max-w-xs">
                  {placedOrder.customerAddress}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Payment Mode:</span>
                <span className="font-bold text-slate-800">{placedOrder.paymentMethod}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Estimated Delivery:</span>
                <span className="font-bold text-emerald-700">24 - 48 Hours</span>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-orange-200 text-base sm:text-lg font-black text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="text-primary text-xl font-sans">৳ {placedOrder.grandTotal}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center">
              <InvoiceDownloadButton
                order={placedOrder}
                variant="primary"
                size="md"
                className="w-full sm:w-auto py-3.5 px-6 shadow-md shadow-orange-500/25"
              />
              <Link
                href="/account/orders"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-extrabold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
              >
                <span>View My Orders History</span>
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY CART STATE */
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 mb-6">
              Please choose our pure artisanal products before accessing the checkout page.
            </p>
            <Link
              href="/#products"
              className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md transition cursor-pointer"
            >
              <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Browse Products</span>
            </Link>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Complete Your Order
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Direct online checkout with authentic artisanal guarantees. Server-verified pricing and reliable delivery.
                </p>
              </div>

              {/* Logged in User Pill */}
              {session?.user && (
                <div className="self-start sm:self-auto flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-orange-50 border border-orange-200/90 text-xs text-slate-700 shadow-2xs max-w-full">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <FaUser className="w-3.5 h-3.5 text-primary shrink-0" />
                    <p className="truncate text-xs">
                      Ordering as <strong className="text-slate-900">{session.user.name}</strong>{" "}
                      <span className="text-slate-500">({session.user.email})</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Sign out to order as a different account"
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-500 hover:text-rose-600 bg-white/70 hover:bg-rose-50 border border-orange-200/60 hover:border-rose-200 text-3xs sm:text-2xs font-extrabold whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
                  >
                    <FaSignOutAlt className="w-3 h-3 shrink-0" />
                    <span className="whitespace-nowrap">Not you?</span>
                  </button>
                </div>
              )}
            </div>

            {/* Email Already Registered Warning Box */}
            {emailExistsAlert && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <FaExclamationCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    An account with <strong>{email}</strong> already exists. Sign in with your password to link your order.
                  </span>
                </div>
                <Link
                  href={`/sign-in?redirect=/checkout`}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap transition cursor-pointer"
                >
                  Sign In to Continue
                </Link>
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Bot Honeypot */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* LEFT COLUMN: DELIVERY, ACCOUNT, PAYMENT (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Delivery Region */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <FaTruck className="text-primary w-4 h-4" />
                    <span>1. Delivery Destination Region</span>
                  </h2>
                  <p className="text-3xs sm:text-xs text-slate-500 mb-3">
                    Select your delivery region to calculate accurate courier charges.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea("ctg")}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex justify-between items-center ${
                        deliveryArea === "ctg"
                          ? "border-primary bg-orange-50/70 text-orange-950 ring-2 ring-primary/80 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <span className="block font-extrabold text-xs sm:text-sm text-slate-900">
                          Inside Chittagong
                        </span>
                        <span className="text-3xs text-slate-500">Chattogram Metro Area</span>
                      </div>
                      <span className="text-sm font-black text-primary font-sans">৳ 60</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryArea("outside")}
                      className={`p-4 rounded-2xl border text-left transition cursor-pointer flex justify-between items-center ${
                        deliveryArea === "outside"
                          ? "border-primary bg-orange-50/70 text-orange-950 ring-2 ring-primary/80 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <span className="block font-extrabold text-xs sm:text-sm text-slate-900">
                          Outside Chittagong
                        </span>
                        <span className="text-3xs text-slate-500">All other districts of BD</span>
                      </div>
                      <span className="text-sm font-black text-primary font-sans">৳ 120</span>
                    </button>
                  </div>
                </div>

                {/* 2. Customer Delivery Information */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FaUser className="text-primary w-4 h-4" />
                    <span>2. Delivery Information</span>
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Abdullah Al Mamun"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Phone Number (For Courier) <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 018XXXXXXXX"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Delivery Address (House, Road, Area) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={addressInputRef}
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House #24, Road #3, Sector #10, Uttara, Dhaka"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                    />
                  </div>

                  {/* Pathao Reusable Cascading Location Picker */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <FaMapMarkerAlt className="text-primary w-3.5 h-3.5" />
                      <span>Pathao Delivery Hub & Area (Optional for exact dispatch)</span>
                    </div>
                    <PathaoLocationPicker
                      isPublic={true}
                      onChange={(val) => {
                        setPathaoLocation(val);
                        if (val.cityName) {
                          const lowerCity = val.cityName.toLowerCase();
                          if (lowerCity.includes("chittagong") || lowerCity.includes("chattogram")) {
                            setDeliveryArea("ctg");
                          } else {
                            setDeliveryArea("outside");
                          }
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Special Delivery Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Call before arrival or leave with security"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* 3. Account Security (Shown ONLY to Guests) */}
                {!session?.user && (
                  <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                          <FaLock className="text-primary w-4 h-4" />
                          <span>3. Account Details & Security</span>
                        </h2>
                        <p className="text-3xs sm:text-xs text-slate-500 mt-1">
                          Your customer account will be created automatically. You can track your parcel, view past orders, and request re-orders anytime.
                        </p>
                      </div>
                      <span className="text-3xs font-extrabold text-primary bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                        Auto Setup
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Account Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        ref={emailInputRef}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@example.com"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Create Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            ref={passwordInputRef}
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="w-4 h-4" />
                            ) : (
                              <FaEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            ref={confirmPasswordInputRef}
                            type={showPassword ? "text" : "password"}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className={`w-full px-4 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border focus:outline-none focus:ring-2 bg-white text-slate-900 ${
                              confirmPassword && confirmPassword !== password
                                ? "border-rose-400 focus:ring-rose-400"
                                : "border-slate-300 focus:ring-primary focus:border-primary"
                            }`}
                          />
                          {confirmPassword && confirmPassword === password && (
                            <FaCheck className="absolute right-3 top-3 text-emerald-500 w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Terms & Privacy Policy Checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                        <input
                          ref={termsCheckboxRef}
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-0.5 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
                        />
                        <span>
                          I agree to Hatkhola-Bazar&apos;s{" "}
                          <Link
                            href="/refund-policy"
                            target="_blank"
                            className="text-primary font-bold hover:underline"
                          >
                            Terms of Service and Refund Policy
                          </Link>
                          .
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* 4. Payment Method */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FaMoneyBillWave className="text-primary w-4 h-4" />
                    <span>{session?.user ? "3." : "4."} Payment Method</span>
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "COD", label: "Cash on Delivery", badge: "Pay on Arrival" },
                      { id: "bKash", label: "bKash", badge: "Personal / Agent" },
                      { id: "Nagad", label: "Nagad", badge: "Personal / Agent" },
                    ].map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`p-2.5 sm:p-3.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-0.5 sm:gap-1 ${
                          paymentMethod === pm.id
                            ? "border-primary bg-orange-50/70 text-orange-950 ring-2 ring-primary/80 shadow-xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-orange-200"
                        }`}
                      >
                        <span className="font-extrabold text-2xs sm:text-sm text-slate-900 whitespace-nowrap">
                          {pm.label}
                        </span>
                        <span className="text-3xs text-slate-500 font-medium whitespace-nowrap">
                          {pm.badge}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic bKash & Nagad input fields */}
                  {(paymentMethod === "bKash" || paymentMethod === "Nagad") && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3.5 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-amber-200/80">
                        <div>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                            Send Money to Official {paymentMethod} Number:
                          </span>
                          <p className="text-3xs text-slate-600">
                            Send total payable amount <strong>৳ {grandTotal}</strong> to:
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-200 shadow-2xs">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {business.phone}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyPaymentNumber}
                            className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                          >
                            {copiedNumber ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                            <span>{copiedNumber ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Number you sent from <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={senderNumberRef}
                            type="tel"
                            required
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            placeholder="e.g. 01XXXXXXXXX"
                            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Transaction ID (TrxID) <span className="text-red-500">*</span>
                          </label>
                          <input
                            ref={trxIdRef}
                            type="text"
                            required
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            placeholder="e.g. BL7K9X2..."
                            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-slate-900 font-mono uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Authentic Trust Badge */}
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 flex items-center gap-3.5 shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-300/50">
                      <FaShieldAlt className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-900">
                          100% Authentic & Safe Delivery Assurance
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </div>
                      <p className="text-3xs sm:text-xs text-slate-600 font-medium mt-0.5 leading-snug">
                        Open and inspect the jar and seal packaging before making payment to the courier rider.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: STICKY ORDER SUMMARY (5 Cols) */}
              <div className="lg:col-span-5 sticky top-24 space-y-4">
                <div className="p-6 rounded-3xl bg-white border border-orange-200/90 shadow-md space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <FaShoppingBag className="text-primary w-4 h-4" />
                      <span>Order Summary</span>
                    </h2>
                    <span className="text-xs font-bold font-sans text-slate-500">
                      {totalCount} item(s)
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-3 items-center text-xs">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                          <p className="text-3xs text-primary font-semibold">
                            {item.option} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-black text-slate-900 font-sans">
                          ৳ {item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Voucher Section */}
                  <div className="pt-2">
                    <VoucherSection
                      items={items.map((it) => ({
                        productId: it.productId || it.id,
                        productName: it.name,
                        price: it.price,
                        quantity: it.quantity,
                      }))}
                      phone={phone}
                      appliedVoucher={appliedVoucher}
                      onApplyVoucher={setAppliedVoucher}
                      onRemoveVoucher={() => setAppliedVoucher(null)}
                      customerVouchers={customerVouchers}
                    />
                  </div>

                  {/* Price Calculations */}
                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-bold text-slate-900 font-sans">{formatTaka(subtotal)}</span>
                    </div>

                    {discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Voucher Discount:</span>
                        <span className="font-bold font-mono">-{formatTaka(discountTotal)}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>
                        Delivery Fee (
                        {deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong"}
                        ):
                      </span>
                      <span className="font-bold text-slate-900 font-sans">
                        {formatTaka(deliveryCharge)}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-orange-200 text-slate-900">
                      <span className="text-sm font-extrabold">Total Payable:</span>
                      <span className="text-2xl font-black text-primary font-sans">
                        {formatTaka(grandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Submit Order Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-4 px-4 sm:px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xs sm:text-sm whitespace-nowrap shadow-lg shadow-orange-500/25 transition cursor-pointer transform active:scale-98 disabled:opacity-50"
                    >
                      <span>
                        {isSubmitting
                          ? "Placing Order..."
                          : `Confirm Online Order (৳ ${grandTotal})`}
                      </span>
                    </button>
                    <p className="text-center text-3xs text-slate-400 mt-2">
                      Server-recalculated prices. Pathao delivery dispatched upon review.
                    </p>
                  </div>
                </div>

                {/* Direct Helpline */}
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 text-3xs text-slate-600 text-center space-y-1">
                  <p className="font-bold text-slate-800">Questions about your order?</p>
                  <p>
                    Call helpline directly at <strong>{business.phone}</strong>
                  </p>
                </div>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
