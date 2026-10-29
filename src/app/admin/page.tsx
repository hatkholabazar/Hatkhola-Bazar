"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaMoneyBillWave,
  FaBoxes,
  FaChartLine,
  FaExclamationTriangle,
  FaPlus,
  FaArrowRight,
  FaHistory,
  FaCheckCircle,
  FaBan,
  FaCashRegister,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminApi, IDashboardReport, IPreOrderMetrics } from "@/lib/admin-api";
import { formatTaka, formatGramsToKg, formatAdminDate } from "@/config/admin-labels";

export default function AdminDashboardPage() {
  const [report, setReport] = useState<IDashboardReport | null>(null);
  const [preOrderMetrics, setPreOrderMetrics] = useState<IPreOrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [reportData, metricsData] = await Promise.all([
          adminApi.getDashboardReport(),
          adminApi.getPreOrderMetrics().catch(() => null),
        ]);
        setReport(reportData);
        setPreOrderMetrics(metricsData);
      } catch (err) {
        console.error("Failed to load dashboard report:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Operations Overview"
        subtitle="Live performance metrics for Hatkhola Bazar artisanal batches"
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/stock"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <FaPlus className="text-xs text-orange-500" />
              <span>New Batch</span>
            </Link>
            <Link
              href="/admin/sales"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
            >
              <FaCashRegister className="text-xs" />
              <span>Record Sale</span>
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Today's Revenue */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Today&apos;s Revenue
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <FaMoneyBillWave className="text-sm" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatTaka(report?.today?.revenue ?? 0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {report?.today?.orderCount ?? 0} direct & courier sales
              </p>
            </div>
          </div>

          {/* Card 2: Today's Gross Profit */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Today&apos;s Gross Profit
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FaChartLine className="text-sm" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 tracking-tight">
                {formatTaka(report?.today?.profit ?? 0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                COGS: {formatTaka(report?.today?.cogs ?? 0)} (FIFO accurate)
              </p>
            </div>
          </div>

          {/* Card 3: Stock on Hand Weight */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Stock on Hand
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaBoxes className="text-sm" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {report?.totalStockWeightKg?.toFixed(1) ?? "0.0"} kg
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Across {report?.activeBatchCount ?? 0} active village batches
              </p>
            </div>
          </div>

          {/* Card 4: Inventory Book Value */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Inventory Book Value
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FaMoneyBillWave className="text-sm" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatTaka(report?.totalStockValue ?? 0)}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Cost remaining (landed + freight)
              </p>
            </div>
          </div>
        </div>

        {/* Pre-Order Demand & Commitments Overview */}
        {preOrderMetrics && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Pre-Order Demand & Commitments
                </h3>
                <p className="text-xs text-slate-500">
                  Advance customer demand, held liabilities & batch shortfall
                </p>
              </div>
              <Link
                href="/admin/preorders"
                className="text-xs text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1"
              >
                <span>View All Pre-orders</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                  Open Pre-Orders
                </span>
                <div className="text-xl font-extrabold text-amber-950 mt-1">
                  {preOrderMetrics.openCount}
                </div>
                <span className="text-[10px] text-amber-700">Pending / Confirmed / Ready</span>
              </div>

              <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200/70">
                <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider block">
                  Total Grams Needed
                </span>
                <div className="text-xl font-extrabold text-orange-950 mt-1">
                  {(preOrderMetrics.openGrams / 1000).toFixed(1)} kg
                </div>
                <span className="text-[10px] text-orange-700">Advance harvest demand</span>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/70">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                  Deposits Held (Liability)
                </span>
                <div className="text-xl font-extrabold text-blue-700 mt-1">
                  {formatTaka(preOrderMetrics.depositsHeld)}
                </div>
                <span className="text-[10px] text-blue-600">Customer deposit liabilities</span>
              </div>

              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-200/70">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                  Stock Shortfall
                </span>
                <div className="text-xl font-extrabold text-rose-600 mt-1">
                  {(
                    preOrderMetrics.productDemands.reduce((acc, p) => acc + p.shortfallGrams, 0) /
                    1000
                  ).toFixed(1)}{" "}
                  kg
                </div>
                <span className="text-[10px] text-rose-600">Shortfall against active stock</span>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Warning Alert */}
        {report?.lowStockProducts && report.lowStockProducts.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <FaExclamationTriangle className="text-base" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Low Stock Threshold Alert
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  {report.lowStockProducts.map((p) => (
                    <span key={p.code} className="inline-block mr-3">
                      <strong>{p.name}</strong>: {p.currentStockKg} kg left (Threshold: {p.thresholdKg} kg)
                    </span>
                  ))}
                </p>
              </div>
            </div>
            <Link
              href="/admin/stock"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0"
            >
              <span>Add Stock Batch</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>
        )}

        {/* Two Column Layout: Recent Sales & Active Batches */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Recent Incoming Orders & Sales */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Sales & Allocations
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time sales deducted via FIFO logic
                </p>
              </div>
              <Link
                href="/admin/sales"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="p-5 flex-1 divide-y divide-slate-100">
              {report?.recentSales && report.recentSales.length > 0 ? (
                report.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          {sale.customerName || "Walk-in Customer"}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                          {sale.channel}
                        </span>
                        {sale.status === "voided" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 flex items-center gap-1">
                            <FaBan className="text-[8px]" /> VOIDED
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {sale.items.map((i) => `${i.qtyG}g (${i.optionLabel})`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900">
                        {formatTaka(sale.totalRevenue)}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-semibold">
                        +{formatTaka(sale.grossProfit)} profit
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No sales recorded yet. Click &ldquo;Record Sale&rdquo; to begin.
                </div>
              )}
            </div>
          </div>

          {/* Right: Active Batches on Hand */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Stock Batches on Hand
                </h3>
                <p className="text-xs text-slate-500">
                  Tracked by server batch number and received weight
                </p>
              </div>
              <Link
                href="/admin/stock"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
              >
                <span>Manage Batches</span>
                <FaArrowRight className="text-[10px]" />
              </Link>
            </div>

            <div className="p-5 flex-1 divide-y divide-slate-100">
              {report?.recentBatches && report.recentBatches.length > 0 ? (
                report.recentBatches.slice(0, 5).map((batch) => {
                  const percentLeft =
                    batch.receivedQtyG > 0
                      ? Math.round((batch.qtyRemainingG / batch.receivedQtyG) * 100)
                      : 0;

                  return (
                    <div key={batch._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800">
                            {batch.batchNo}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({batch.supplierName})
                          </span>
                          {batch.status === "depleted" && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              Depleted
                            </span>
                          )}
                        </div>
                        <div className="w-36 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              percentLeft < 20
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentLeft}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">
                          {formatGramsToKg(batch.qtyRemainingG)} left
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Total: {formatGramsToKg(batch.receivedQtyG)}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active batches recorded. Add your first harvest batch.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
