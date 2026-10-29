"use client";

import { useState, useEffect } from "react";
import {
  FaUndoAlt,
  FaSearch,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaImage,
  FaPhoneAlt,
  FaWhatsapp,
  FaMoneyBillWave,
  FaBoxOpen,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import { formatTaka, formatAdminDate } from "@/config/admin-labels";

interface RefundItem {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  orderAmount: number;
  reason: string;
  notes: string;
  images: string[];
  requestedAt: string;
  status: "Pending" | "Approved" | "Replaced" | "Rejected";
  resolutionNote?: string;
}

export default function AdminRefundsPage() {
  const [refunds, setRefunds] = useState<RefundItem[]>([
    {
      id: "ref-1",
      orderId: "HK-94821",
      customerName: "Tanvir Ahmed",
      customerPhone: "01819334455",
      orderAmount: 2360,
      reason: "Damaged / Broken packaging during transit",
      notes: "The outer delivery carton was dented by the courier and the glass jar seal leaked slightly into the bubble wrap.",
      images: [
        "/hatkhola-logo.png",
      ],
      requestedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      status: "Pending",
    },
    {
      id: "ref-2",
      orderId: "HK-94710",
      customerName: "Farhana Yasmin",
      customerPhone: "01712889900",
      orderAmount: 1460,
      reason: "Broken seal upon courier unboxing",
      notes: "Lid was loose when unwrapped from the Steadfast parcel bag.",
      images: [],
      requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      status: "Approved",
      resolutionNote: "100% bKash refund sent to 01712889900 (TrxID: 9X8A1B)",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRefund, setSelectedRefund] = useState<RefundItem | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resolutionInput, setResolutionInput] = useState("");

  const handleUpdateStatus = (
    refundId: string,
    newStatus: "Approved" | "Replaced" | "Rejected"
  ) => {
    const updated = refunds.map((r) => {
      if (r.id === refundId) {
        return {
          ...r,
          status: newStatus,
          resolutionNote: resolutionInput.trim() || undefined,
        };
      }
      return r;
    });

    setRefunds(updated);
    setSelectedRefund(null);
    setResolutionInput("");
  };

  const filteredRefunds = refunds.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        r.orderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerPhone.includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Refund Requests & Quality Claims"
        subtitle="Review unboxing photos, resolve guarantee claims, and issue reversals"
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Order ID, customer, phone..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="all">All Claims</option>
              <option value="Pending">Pending Review</option>
              <option value="Approved">Approved & Refunded</option>
              <option value="Replaced">Replacement Dispatched</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Refunds Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Claimed Reason</th>
                  <th className="py-3 px-4">Order Value</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Requested Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredRefunds.length > 0 ? (
                  filteredRefunds.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {r.orderId}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{r.customerName}</p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <FaWhatsapp className="text-[10px] text-emerald-600" />
                          <span>{r.customerPhone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 truncate">
                          {r.reason}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {r.notes}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatTaka(r.orderAmount)}
                      </td>
                      <td className="py-3 px-4">
                        {r.images.length > 0 ? (
                          <button
                            onClick={() => setPreviewImage(r.images[0])}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] hover:bg-blue-100"
                          >
                            <FaImage /> {r.images.length} photo(s)
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">No photos</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {formatAdminDate(r.requestedAt)}
                      </td>
                      <td className="py-3 px-4">
                        {r.status === "Pending" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            Pending Review
                          </span>
                        )}
                        {r.status === "Approved" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Refund Approved
                          </span>
                        )}
                        {r.status === "Replaced" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Replaced
                          </span>
                        )}
                        {r.status === "Rejected" && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedRefund(r)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                        >
                          <FaEye className="text-[10px]" /> Review Claim
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No refund requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Claim Review & Resolution */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Refund Claim for {selectedRefund.orderId}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRefund.customerName} ({selectedRefund.customerPhone})
                </p>
              </div>
              <button
                onClick={() => setSelectedRefund(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Reason:</span>
                <span className="font-bold text-slate-900">
                  {selectedRefund.reason}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Total:</span>
                <span className="font-bold text-slate-900">
                  {formatTaka(selectedRefund.orderAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Customer Explanation:</span>
                <p className="p-2 bg-white rounded border border-slate-200 text-slate-700 italic">
                  &ldquo;{selectedRefund.notes}&rdquo;
                </p>
              </div>
            </div>

            {/* Photos */}
            {selectedRefund.images.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Uploaded Customer Photos
                </h4>
                <div className="flex gap-2">
                  {selectedRefund.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPreviewImage(img)}
                      className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden relative group"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img}
                        alt="Refund proof"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Note / Trx ID / Courier Tracking
              </label>
              <input
                type="text"
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                placeholder="e.g. bKash refund sent to customer (TrxID: 9X8A1B)"
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div className="pt-2 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedRefund.id, "Rejected")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100"
              >
                Reject Claim
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedRefund.id, "Replaced")}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                Send Replacement
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus(selectedRefund.id, "Approved")}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Approve & Refund 100%
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative max-w-xl w-full bg-white rounded-xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/70 text-white rounded-full p-2 hover:bg-slate-900"
            >
              <FaTimes />
            </button>
            <div className="max-h-[80vh] flex items-center justify-center bg-slate-100 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Product preview"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

