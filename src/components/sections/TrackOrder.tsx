"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaSearch,
  FaTruck,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaSpinner,
  FaUndoAlt,
  FaHome,
} from "react-icons/fa";
import { adminApi } from "@/lib/admin-api";

type StepType =
  | "Confirmed"
  | "Sent to courier"
  | "Out for delivery"
  | "Delivered"
  | "Returned";

interface TrackResult {
  success: boolean;
  statusLabel: { en: string; bn: string };
  step: StepType;
  updatedAt: string;
}

const STEPS: { key: StepType; labelEn: string; labelBn: string }[] = [
  { key: "Confirmed", labelEn: "Confirmed", labelBn: "নিশ্চিত" },
  { key: "Sent to courier", labelEn: "Sent to Courier", labelBn: "কুরিয়ারে প্রেরিত" },
  { key: "Out for delivery", labelEn: "Out for Delivery", labelBn: "ডেলিভারিতে" },
  { key: "Delivered", labelEn: "Delivered", labelBn: "ডেলিভারি সম্পন্ন" },
];

export default function TrackOrder() {
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [lastTrackedParams, setLastTrackedParams] = useState<{
    orderNo: string;
    phone: string;
  } | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTracking = async (ord: string, ph: string, isSilent = false) => {
    if (!isSilent) {
      setLoading(true);
      setError(null);
    }
    try {
      const data = await adminApi.trackOrderPublic(ord.trim(), ph.trim());
      setResult(data);
      setLastTrackedParams({ orderNo: ord.trim(), phone: ph.trim() });
    } catch (err: any) {
      if (!isSilent) {
        setError(err.message || "No order found with these details.");
        setResult(null);
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNo.trim() || !phone.trim()) {
      setError("Please enter both your Order Number and Mobile Phone.");
      return;
    }
    fetchTracking(orderNo, phone);
  };

  // Auto-polling every 60s while visible if not terminal status
  useEffect(() => {
    if (!result || !lastTrackedParams) return;
    if (result.step === "Delivered" || result.step === "Returned") {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    pollIntervalRef.current = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchTracking(lastTrackedParams.orderNo, lastTrackedParams.phone, true);
      }
    }, 60000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [result, lastTrackedParams]);

  const getStepIndex = (step: StepType) => {
    if (step === "Returned") return -1;
    return STEPS.findIndex((s) => s.key === step);
  };

  const activeIndex = result ? getStepIndex(result.step) : -1;

  return (
    <section id="track-order" className="py-16 sm:py-24 bg-gradient-to-b from-white via-orange-50/20 to-white border-b border-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
            Real-Time Tracking
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Track Your Order
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Enter your order number and mobile number to see live delivery updates.
          </p>
        </div>

        {/* Tracking Card */}
        <div className="bg-white rounded-3xl border border-orange-100 shadow-xl shadow-orange-500/5 p-6 sm:p-10 overflow-hidden">
          {/* Tracking Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-0 sm:flex sm:gap-3">
            <div className="flex-1">
              <label htmlFor="track-order-no" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Order # (অর্ডার নং)
              </label>
              <input
                id="track-order-no"
                type="text"
                placeholder="e.g. ORD-123456 or PRE-2610-001"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="track-phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number (মোবাইল নং)
              </label>
              <input
                id="track-phone"
                type="tel"
                placeholder="017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 text-sm font-mono rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-slate-50/50"
              />
            </div>

            <div className="sm:self-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 min-w-[130px]"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Tracking...</span>
                  </>
                ) : (
                  <>
                    <FaSearch className="text-sm" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
              <FaExclamationCircle className="text-red-500 shrink-0 text-base" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* Tracking Result View */}
          {result && (
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-6 animate-fade-in">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-orange-50/60 border border-orange-100">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Current Status</div>
                  <div className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                    <span>{result.statusLabel.en}</span>
                    <span className="text-slate-400 font-normal">/</span>
                    <span className="text-primary font-bold">{result.statusLabel.bn}</span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] text-slate-400 font-medium flex items-center sm:justify-end gap-1">
                    <FaClock className="text-slate-400 text-[10px]" />
                    <span>Last Updated:</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-700 font-mono mt-0.5">
                    {new Date(result.updatedAt).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>

              {/* Step Progress Tracker */}
              {result.step === "Returned" ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3">
                  <FaUndoAlt className="text-rose-500 text-lg shrink-0" />
                  <div>
                    <strong>Returned to Merchant:</strong> This parcel has been returned to Hatkhola Bazar.
                    If you have questions, please contact our support team.
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {/* Connecting Bar */}
                    <div className="absolute top-5 left-[12%] right-[12%] h-1 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500 motion-reduce:transition-none"
                        style={{
                          width: `${Math.max(0, Math.min(100, (activeIndex / (STEPS.length - 1)) * 100))}%`,
                        }}
                      />
                    </div>

                    {STEPS.map((s, idx) => {
                      const isCompleted = activeIndex >= idx;
                      const isCurrent = activeIndex === idx;

                      return (
                        <div key={s.key} className="flex flex-col items-center text-center relative z-10">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs ${
                              isCompleted
                                ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                : "bg-white border-2 border-slate-300 text-slate-400"
                            } ${isCurrent ? "ring-4 ring-emerald-500/20 scale-105" : ""}`}
                          >
                            {isCompleted ? (
                              <FaCheckCircle className="text-base" />
                            ) : idx === 1 ? (
                              <FaBoxOpen className="text-xs" />
                            ) : idx === 2 ? (
                              <FaTruck className="text-xs" />
                            ) : (
                              <FaHome className="text-xs" />
                            )}
                          </div>
                          <span
                            className={`text-xs font-bold mt-2 ${
                              isCurrent
                                ? "text-slate-900"
                                : isCompleted
                                ? "text-emerald-700"
                                : "text-slate-400"
                            }`}
                          >
                            {s.labelEn}
                          </span>
                          <span
                            className={`text-[10px] ${
                              isCurrent
                                ? "text-primary font-semibold"
                                : isCompleted
                                ? "text-emerald-600 font-medium"
                                : "text-slate-400"
                            }`}
                          >
                            {s.labelBn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Un-dispatched Friendly Message */}
              {result.step === "Confirmed" && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3">
                  <FaBoxOpen className="text-amber-600 text-lg shrink-0 mt-0.5" />
                  <div>
                    <strong>Preparation in Progress:</strong> Your order is confirmed and being prepared carefully at our hub.
                    <div className="text-xs text-amber-700 mt-0.5">
                      আপনার অর্ডারটি নিশ্চিত করা হয়েছে এবং অত্যন্ত সতর্কতার সাথে প্রস্তুত করা হচ্ছে।
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
