"use client";

import { useState, useEffect } from "react";
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
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";

export default function CheckoutPage() {
  const router = useRouter();
  const { business } = siteConfig;
  const { items, subtotal, totalCount, clearCart } = useCart();

  // Form State
  const [deliveryArea, setDeliveryArea] = useState<"ctg" | "outside">("ctg");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Account creation fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "bKash" | "Nagad">("COD");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Status & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [placedOrder, setPlacedOrder] = useState<{
    orderId: string;
    total: number;
    itemsCount: number;
    area: string;
    customerName: string;
    phone: string;
    paymentMethod: string;
    deliveryAddress: string;
  } | null>(null);

  // Delivery calculation: Inside Ctg = 60 tk, Outside Ctg = 120 tk
  const deliveryCharge = deliveryArea === "ctg" ? 60 : 120;
  const grandTotal = subtotal + (items.length > 0 ? deliveryCharge : 0);

  // Load saved profile data if returning customer
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hatkhola_customer_profile");
      if (stored) {
        const p = JSON.parse(stored);
        if (p.name) setName(p.name);
        if (p.phone) setPhone(p.phone);
        if (p.address) setAddress(p.address);
        if (p.district === "Outside Ctg") setDeliveryArea("outside");
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

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg("Please fill in your Full Name, Phone Number, and Delivery Address.");
      return;
    }

    if (!password.trim() || password.length < 6) {
      setErrorMsg("Please create a password of at least 6 characters for your customer account.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Password and Confirm Password do not match. Please re-check.");
      return;
    }

    if (paymentMethod === "bKash" || paymentMethod === "Nagad") {
      if (!senderNumber.trim() || !trxId.trim()) {
        setErrorMsg(`Please provide your ${paymentMethod} sender number and Transaction ID (TrxID).`);
        return;
      }
    }

    if (items.length === 0) {
      setErrorMsg("Your cart is currently empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);

    const orderId = `HB-${Date.now().toString().slice(-6)}`;
    const newOrder = {
      orderId,
      createdAt: new Date().toISOString(),
      customer: {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      },
      deliveryArea: deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong",
      deliveryCharge,
      items: [...items],
      subtotal,
      grandTotal,
      paymentMethod,
      paymentDetails:
        paymentMethod !== "COD"
          ? {
              senderNumber: senderNumber.trim(),
              trxId: trxId.trim(),
            }
          : undefined,
      status: "Confirmed",
    };

    // Save order in localStorage
    try {
      const existing = localStorage.getItem("hatkhola_orders");
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newOrder);
      localStorage.setItem("hatkhola_orders", JSON.stringify(list));

      // Save customer profile & account session
      localStorage.setItem(
        "hatkhola_customer_profile",
        JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          district: deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong",
          notes: notes.trim(),
          isRegistered: true,
          lastOrderAt: new Date().toISOString(),
        })
      );
    } catch {
      // Ignore localStorage errors
    }

    // Attempt to persist to API / Database
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order: newOrder,
          account: {
            name: name.trim(),
            phone: phone.trim(),
            password: password.trim(),
            address: address.trim(),
          },
        }),
      });
    } catch (err) {
      console.warn("Could not save to remote backend, saved locally.", err);
    }

    // Success state
    setPlacedOrder({
      orderId,
      total: grandTotal,
      itemsCount: totalCount,
      area: deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong",
      customerName: name.trim(),
      phone: phone.trim(),
      paymentMethod:
        paymentMethod === "COD"
          ? "Cash on Delivery"
          : `${paymentMethod} (TrxID: ${trxId.trim()})`,
      deliveryAddress: address.trim(),
    });

    clearCart();
    setIsSubmitting(false);
  };

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-3xs font-extrabold whitespace-nowrap">
            <FaShieldAlt className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>100% Encrypted & Secure Checkout</span>
          </div>
        </div>
        {/* ORDER SUCCESS VIEW */}
        {placedOrder ? (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
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
                <span className="font-black text-slate-900 font-mono text-sm sm:text-base text-primary">
                  {placedOrder.orderId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Items Count:</span>
                <span className="font-bold text-slate-800">{placedOrder.itemsCount} item(s)</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delivery Destination:</span>
                <span className="font-bold text-slate-800">{placedOrder.area}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contact Phone:</span>
                <span className="font-bold text-slate-800">{placedOrder.phone}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Delivery Address:</span>
                <span className="font-bold text-slate-800 text-right max-w-xs">{placedOrder.deliveryAddress}</span>
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
                <span className="text-primary text-xl font-sans">৳ {placedOrder.total}</span>
              </div>

              <div className="mt-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-3xs sm:text-xs text-amber-900 flex items-center gap-2">
                <FaLock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  Your account has been created with your provided password. You can track this order in your profile anytime!
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md shadow-orange-500/20 transition cursor-pointer"
              >
                <span>View Order in Profile / Order History</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-4 sm:px-6 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* EMPTY CART STATE ON CHECKOUT */
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <FaShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Your Cart is Empty
            </h2>
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
          /* CHECKOUT FORM & SUMMARY TWO-COLUMN LAYOUT */
          <div>
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Complete Your Order
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Direct website checkout with authentic artisanal guarantees. No hassle, no complicated registration.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-sm animate-fade-in">
                <FaExclamationCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: DELIVERY, ACCOUNT, PAYMENT (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Delivery Destination */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <FaTruck className="text-primary w-4 h-4" />
                    <span>1. Delivery Destination</span>
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
                        <span className="text-3xs text-slate-500">
                          Chattogram City & Metro area
                        </span>
                      </div>
                      <span className="text-sm font-black text-primary font-sans">
                        ৳ 60
                      </span>
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
                        <span className="text-3xs text-slate-500">
                          All other districts of Bangladesh
                        </span>
                      </div>
                      <span className="text-sm font-black text-primary font-sans">
                        ৳ 120
                      </span>
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
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +880 18XXXXXXXX"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Delivery Address (House, Road, Area, Ward/Thana) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. House #24, Road #3, GEC Circle, Chattogram"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
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
                      placeholder="e.g. Please call 30 mins before arrival or leave with gatekeeper"
                      className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                    />
                  </div>
                </div>

                {/* 3. Account Password (Zero-friction Customer Registration) */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <FaLock className="text-primary w-4 h-4" />
                        <span>3. Account Security (Customer Profile)</span>
                      </h2>
                      <p className="text-3xs sm:text-xs text-slate-500 mt-1">
                        We don&apos;t make you go through tedious sign up pages! Set a password here so your account is created automatically to track orders and request refunds.
                      </p>
                    </div>
                    <span className="text-3xs font-extrabold text-primary bg-orange-100 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      Auto Setup
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Create Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter your password"
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
                </div>

                {/* 4. Payment Method */}
                <div className="p-5 sm:p-6 rounded-3xl bg-white border border-orange-200/80 shadow-xs space-y-4">
                  <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FaMoneyBillWave className="text-primary w-4 h-4" />
                    <span>4. Payment Method</span>
                  </h2>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "COD", label: "Cash on Delivery", badge: "Most Popular" },
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
                            Send total payable amount <strong>৳ {grandTotal}</strong> to this number:
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
                            Number you have sent from <span className="text-red-500">*</span>
                          </label>
                          <input
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

                  {/* Redesigned Professional Trust Badge (Item 2) */}
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
                        Open and inspect the jar & packaging condition before making payment to the courier rider.
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
                          <h4 className="font-bold text-slate-900 truncate">
                            {item.name}
                          </h4>
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

                  {/* Price Calculations */}
                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Items Subtotal:</span>
                      <span className="font-bold text-slate-900 font-sans">৳ {subtotal}</span>
                    </div>

                    <div className="flex justify-between">
                      <span>
                        Delivery Fee ({deliveryArea === "ctg" ? "Inside Chittagong" : "Outside Chittagong"}):
                      </span>
                      <span className="font-bold text-slate-900 font-sans">৳ {deliveryCharge}</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-3 border-t border-orange-200 text-slate-900">
                      <span className="text-sm font-extrabold">Total Payable:</span>
                      <span className="text-2xl font-black text-primary font-sans">৳ {grandTotal}</span>
                    </div>
                  </div>

                  {/* Submit Order Button (NO WHATSAPP ON CHECKOUT PAGE) */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 py-4 px-4 sm:px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black text-xs sm:text-sm whitespace-nowrap shadow-lg shadow-orange-500/25 transition cursor-pointer transform active:scale-98 disabled:opacity-50"
                    >
                      <span className="whitespace-nowrap">
                        {isSubmitting ? "Placing Order..." : `Confirm Online Order (৳ ${grandTotal})`}
                      </span>
                    </button>
                    <p className="text-center text-3xs text-slate-400 mt-2">
                      By confirming, your order will be booked directly on our system.
                    </p>
                  </div>
                </div>

                {/* Direct Return / Help Guarantee */}
                <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200/70 text-3xs text-slate-600 text-center space-y-1">
                  <p className="font-bold text-slate-800">
                    Questions about your order?
                  </p>
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

