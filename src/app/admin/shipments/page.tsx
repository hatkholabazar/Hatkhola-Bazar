"use client";

import React, { useState, useEffect } from "react";
import {
  FaTruck,
  FaSearch,
  FaFilter,
  FaFileCsv,
  FaSyncAlt,
  FaExternalLinkAlt,
  FaTimesCircle,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaBoxOpen,
  FaHistory,
  FaCopy,
  FaCheck,
} from "react-icons/fa";
import { adminApi, IShipment, IPathaoStatus, resolvePathaoStatus } from "@/lib/admin-api";

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<IShipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pathaoStatus, setPathaoStatus] = useState<IPathaoStatus | null>(null);
  const [checkingConnection, setCheckingConnection] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [orderTypeFilter, setOrderTypeFilter] = useState("");

  // Action states
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedShipmentForHistory, setSelectedShipmentForHistory] = useState<IShipment | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData(true);
    checkConnection();
  }, [statusFilter, orderTypeFilter]);

  // Auto-refresh polling every 60s while visible for non-final shipments
  useEffect(() => {
    const hasActiveNonFinal = shipments.some(
      (s) => !s.finalStatus && (s.status === "created" || s.status === "creating")
    );
    if (!hasActiveNonFinal) return;

    const intervalId = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadData(false);
      }
    }, 60000);

    return () => clearInterval(intervalId);
  }, [shipments, searchTerm, statusFilter, orderTypeFilter]);

  const loadData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await adminApi.getShipments({
        search: searchTerm,
        status: statusFilter || undefined,
        orderType: orderTypeFilter || undefined,
      });
      setShipments(res.shipments || []);
    } catch (err: any) {
      if (showLoading) {
        setActionMessage({ type: "error", text: err.message || "Failed to load shipments." });
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleCopyConsignment = (consignmentId: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(consignmentId);
      setCopiedId(consignmentId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const checkConnection = async () => {
    setCheckingConnection(true);
    try {
      const status = await adminApi.getPathaoStatus();
      setPathaoStatus(status);
    } catch {
      setPathaoStatus({
        connected: false,
        storesCount: 0,
        message: "Failed to connect to Pathao API",
      });
    } finally {
      setCheckingConnection(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleRefreshStatus = async (shipmentId: string) => {
    setRefreshingId(shipmentId);
    setActionMessage(null);
    try {
      const updated = await adminApi.refreshShipment(shipmentId);
      setShipments((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      setActionMessage({
        type: "success",
        text: `Shipment status refreshed: ${updated.pathaoStatus || updated.status}`,
      });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to refresh status" });
    } finally {
      setRefreshingId(null);
    }
  };

  const handleCancelShipment = async (shipmentId: string) => {
    const reason = window.prompt("Reason for manual shipment cancellation in Hatkhola Bazar:");
    if (!reason || !reason.trim()) return;

    setActionMessage(null);
    try {
      const updated = await adminApi.cancelShipment(shipmentId, reason.trim());
      setShipments((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      setActionMessage({
        type: "success",
        text: "Shipment marked as manually cancelled.",
      });
    } catch (err: any) {
      setActionMessage({ type: "error", text: err.message || "Failed to cancel shipment" });
    }
  };

  // Metrics
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(
    (s) => s.pathaoStatus === "In Transit" || s.pathaoStatus === "Pending" || s.status === "created"
  ).length;
  const deliveredCount = shipments.filter(
    (s) => s.pathaoStatus === "Delivered" || s.pathaoStatus === "delivered"
  ).length;
  const attentionCount = shipments.filter(
    (s) => s.status === "failed" || s.status === "unknown"
  ).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-xs">
              <FaTruck className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Courier Logistics</h1>
              <p className="text-xs text-slate-500">
                Pathao Hermes API consignments, tracking, and courier cost accounting
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Pathao Status Pill */}
          <div
            onClick={checkConnection}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors text-xs font-semibold ${
              pathaoStatus?.connected
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-amber-50 border-amber-200 text-amber-700"
            }`}
            title={pathaoStatus?.message || "Click to re-test connection"}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                pathaoStatus?.connected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>
              {checkingConnection
                ? "Checking..."
                : pathaoStatus?.connected
                ? `Pathao Connected (${pathaoStatus.defaultStore?.store_name || "Active Hub"})`
                : "Pathao Offline / Verify API"}
            </span>
          </div>

          {/* CSV Export */}
          <a
            href={adminApi.getShipmentsCsvUrl({
              status: statusFilter || undefined,
              orderType: orderTypeFilter || undefined,
            })}
            download
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-2xs"
          >
            <FaFileCsv className="text-emerald-600 text-sm" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between animate-fade-in ${
            actionMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <FaCheckCircle className="text-emerald-500 text-base" />
            ) : (
              <FaExclamationTriangle className="text-red-500 text-base" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-slate-500 text-xs font-semibold">Total Consignments</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalShipments}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Recorded dispatches</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-blue-600 text-xs font-semibold">In Transit / Pending</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{inTransitCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active with courier</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-emerald-600 text-xs font-semibold">Delivered</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{deliveredCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Completed successfully</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-amber-600 text-xs font-semibold">Needs Attention</div>
          <div className="text-2xl font-bold text-amber-600 mt-1">{attentionCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Failed or timed out</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search by Consignment ID, Order #, Recipient Name or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="created">Created / Active</option>
            <option value="creating">Creating (Lock)</option>
            <option value="failed">Failed</option>
            <option value="unknown">Unknown (Timeout)</option>
            <option value="cancelled_manually">Cancelled</option>
          </select>

          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-hidden"
          >
            <option value="">All Order Types</option>
            <option value="sale">Direct Sales</option>
            <option value="preorder">Pre-orders</option>
          </select>

          <button
            type="button"
            onClick={() => loadData(true)}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reload data"
          >
            <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Date & Order #</th>
                <th className="py-3 px-4">Consignment & Tracking</th>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">COD / Fee</th>
                <th className="py-3 px-4">Courier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaTruck className="text-2xl mx-auto mb-2 text-red-500 animate-bounce" />
                    <span>Loading courier consignments...</span>
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FaBoxOpen className="text-3xl mx-auto mb-2 text-slate-300" />
                    <span>No consignments found matching your criteria.</span>
                  </td>
                </tr>
              ) : (
                shipments.map((s) => {
                  const isCreated = s.status === "created";
                  const isFailed = s.status === "failed";
                  const isUnknown = s.status === "unknown";
                  const isCancelled = s.status === "cancelled_manually";

                  return (
                    <tr key={s._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Date & Order # */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{s.orderNo}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                              s.orderType === "sale"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {s.orderType === "sale" ? "Sale" : "Pre-order"}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ""}
                          </span>
                        </div>
                      </td>

                      {/* Consignment & Tracking */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {s.consignmentId ? (
                          <div>
                            <div className="font-mono font-bold text-red-600 flex items-center gap-1.5">
                              <span>{s.consignmentId}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyConsignment(s.consignmentId!)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                                title="Copy Consignment ID"
                              >
                                {copiedId === s.consignmentId ? (
                                  <FaCheck className="text-[10px] text-emerald-600" />
                                ) : (
                                  <FaCopy className="text-[10px]" />
                                )}
                              </button>
                              {s.trackingUrl && (
                                <a
                                  href={s.trackingUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-red-600 transition-colors ml-0.5"
                                  title="Open in Pathao Tracking"
                                >
                                  <FaExternalLinkAlt className="text-[10px]" />
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Merchant: {s.merchantOrderId}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-400 italic">Not issued</span>
                        )}
                      </td>

                      {/* Recipient */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {s.request?.recipient_name || "—"}
                        </div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {s.request?.recipient_phone || "—"}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">
                          {s.request?.recipient_address || "—"}
                        </div>
                      </td>

                      {/* Package */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">
                          {s.itemWeightKg} kg
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Parcel (48h)
                        </div>
                      </td>

                      {/* COD / Fee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">
                          COD: ৳ {s.amountToCollect.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Fee: ৳ {s.deliveryFee}
                        </div>
                      </td>

                      {/* Courier Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {(() => {
                          const statusInfo = resolvePathaoStatus(s.pathaoStatusSlug || s.pathaoStatus);
                          const colorClasses = {
                            amber: "bg-amber-100 text-amber-800 border-amber-200",
                            blue: "bg-blue-100 text-blue-800 border-blue-200",
                            indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
                            emerald: "bg-emerald-100 text-emerald-800 border-emerald-200",
                            rose: "bg-rose-100 text-rose-800 border-rose-200",
                            slate: "bg-slate-100 text-slate-800 border-slate-200",
                          }[statusInfo.color] || "bg-slate-100 text-slate-800 border-slate-200";

                          return (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorClasses}`}>
                                  {statusInfo.labelEn}
                                </span>
                                {s.finalStatus && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                                    Final
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium pl-0.5">
                                {statusInfo.labelBn}
                              </div>
                              {s.lastRefreshedAt && (
                                <div className="text-[9px] text-slate-400 font-mono pl-0.5">
                                  Synced: {new Date(s.lastRefreshedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                        {s.errorMessage && (
                          <div
                            className="text-[10px] text-red-500 line-clamp-1 max-w-[160px] mt-0.5"
                            title={s.errorMessage}
                          >
                            {s.errorMessage}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* History Log */}
                          <button
                            type="button"
                            onClick={() => setSelectedShipmentForHistory(s)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Dispatch History & Audit Trail"
                          >
                            <FaHistory className="text-xs" />
                          </button>

                          {/* Refresh Status */}
                          {s.consignmentId && !isCancelled && (
                            <button
                              type="button"
                              disabled={refreshingId === s._id}
                              onClick={() => handleRefreshStatus(s._id)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                              title="Fetch latest status from Pathao"
                            >
                              <FaSyncAlt
                                className={`text-[10px] ${
                                  refreshingId === s._id ? "animate-spin text-red-500" : ""
                                }`}
                              />
                              <span>Sync</span>
                            </button>
                          )}

                          {/* Cancel manually */}
                          {isCreated && (
                            <button
                              type="button"
                              onClick={() => handleCancelShipment(s._id)}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                              title="Cancel consignment in local system"
                            >
                              <FaTimesCircle className="text-xs" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal Drawer */}
      {selectedShipmentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FaHistory className="text-red-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  Consignment History: {selectedShipmentForHistory.orderNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedShipmentForHistory(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {(selectedShipmentForHistory.statusHistory || []).map((h, idx) => {
                const info = resolvePathaoStatus(h.slug || h.pathaoStatus || h.status);
                return (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">
                          {h.label || info.labelEn}
                        </span>
                        {h.slug && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-200 text-slate-700">
                            {h.slug}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {h.timestamp ? new Date(h.timestamp).toLocaleString() : ""}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {info.labelBn}
                    </div>
                    {h.pathaoUpdatedAt && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        Pathao Time: {h.pathaoUpdatedAt}
                      </div>
                    )}
                    {h.note && (
                      <div className="text-slate-600 mt-1 text-[11px] italic bg-white p-1.5 rounded border border-slate-100">
                        {h.note}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedShipmentForHistory(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
