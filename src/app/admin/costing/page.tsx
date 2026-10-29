"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaCalculator,
  FaFileExport,
  FaPlus,
  FaSearch,
  FaFilter,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminApi, ICostingItem, IPreOrderMetrics } from "@/lib/admin-api";
import { formatTaka, formatAdminDate } from "@/config/admin-labels";

interface DirectExpense {
  id: string;
  date: string;
  category: string;
  reason: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
}

export default function AdminCostingPage() {
  const [costingItems, setCostingItems] = useState<ICostingItem[]>([]);
  const [preOrderMetrics, setPreOrderMetrics] = useState<IPreOrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Artisanal Live Margin Calculator State (from screenshot)
  const [gheeButterCost, setGheeButterCost] = useState(950);
  const [gheeLaborCost, setGheeLaborCost] = useState(120);
  const [gheeJarCost, setGheeJarCost] = useState(100);
  const [gheeRetailPrice, setGheeRetailPrice] = useState(1400);

  const [gurSapCost, setGurSapCost] = useState(220);
  const [gurLaborCost, setGurLaborCost] = useState(60);
  const [gurBoxCost, setGurBoxCost] = useState(30);
  const [gurRetailPrice, setGurRetailPrice] = useState(450);

  // Direct Expenses state & modal
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenses, setExpenses] = useState<DirectExpense[]>([
    {
      id: "exp-1",
      date: new Date().toISOString().split("T")[0],
      category: "Packaging",
      reason: "500pcs Food-grade Amber Glass Jars & Gold Lids",
      amount: 14500,
      paymentMethod: "Bank Transfer",
      notes: "From Dhaka glass importer",
    },
    {
      id: "exp-2",
      date: new Date().toISOString().split("T")[0],
      category: "Processing & Fuel",
      reason: "Clay oven firewood bundle (2 Maunds)",
      amount: 1800,
      paymentMethod: "Cash",
      notes: "Local bazaar delivery for slow wood fire boiling",
    },
  ]);

  // Form state
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [expenseCategory, setExpenseCategory] = useState("Raw Material");
  const [expenseReason, setExpenseReason] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expensePaymentMethod, setExpensePaymentMethod] = useState("Cash");
  const [expenseNotes, setExpenseNotes] = useState("");

  const loadCosting = async () => {
    try {
      setLoading(true);
      const [costingData, metricsData] = await Promise.all([
        adminApi.getCosting(),
        adminApi.getPreOrderMetrics().catch(() => null),
      ]);
      setCostingItems(costingData.costingSummary || []);
      setPreOrderMetrics(metricsData);
    } catch (err) {
      console.error("Error loading costing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCosting();
  }, []);

  // Ghee calculations
  const totalGheeCost = gheeButterCost + gheeLaborCost + gheeJarCost;
  const gheeProfit = gheeRetailPrice - totalGheeCost;
  const gheeMargin =
    gheeRetailPrice > 0
      ? ((gheeProfit / gheeRetailPrice) * 100).toFixed(1)
      : "0.0";

  // Gur calculations
  const totalGurCost = gurSapCost + gurLaborCost + gurBoxCost;
  const gurProfit = gurRetailPrice - totalGurCost;
  const gurMargin =
    gurRetailPrice > 0 ? ((gurProfit / gurRetailPrice) * 100).toFixed(1) : "0.0";

  // Add Expense Handler
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseReason.trim() || !expenseAmount) return;

    const newExp: DirectExpense = {
      id: `exp-${Date.now()}`,
      date: expenseDate,
      category: expenseCategory,
      reason: expenseReason.trim(),
      amount: Math.round(Number(expenseAmount)),
      paymentMethod: expensePaymentMethod,
      notes: expenseNotes.trim() || undefined,
    };

    setExpenses([newExp, ...expenses]);
    setIsAddExpenseOpen(false);
    setExpenseReason("");
    setExpenseAmount("");
    setExpenseNotes("");
  };

  // CSV Export
  const exportCostingCsv = () => {
    const headers = [
      "BatchNo",
      "Product",
      "ReceivedAt",
      "UnitCostPerKg",
      "TotalCost",
      "CostRemaining",
      "Status",
    ];
    const rows = costingItems.map((c) => [
      c.batchNo,
      c.productName,
      c.purchasedAt,
      c.unitCostPerKg,
      c.totalCost,
      c.costRemaining,
      c.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hatkhola_costing_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCosting = useMemo(() => {
    return costingItems.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        return (
          item.batchNo.toLowerCase().includes(s) ||
          item.productName.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [costingItems, statusFilter, searchTerm]);

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Artisanal Costing & Net Profit Analyzer"
        subtitle="Break down raw sourcing, traditional boiling labor, packaging jars, and live margins"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
            >
              <FaPlus className="text-xs" />
              <span>Add Direct Cost</span>
            </button>
            <button
              onClick={exportCostingCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <FaFileExport className="text-xs text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Pre-Order Demand & Customer Liabilities Summary */}
        {preOrderMetrics && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Customer Deposits Held (Liability)
              </span>
              <div className="text-xl font-extrabold text-blue-700 mt-1">
                {formatTaka(preOrderMetrics.depositsHeld)}
              </div>
              <span className="text-[10px] text-slate-400">
                Excluded from revenue until fulfilment
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Open Pre-Order Demand
              </span>
              <div className="text-xl font-extrabold text-amber-600 mt-1">
                {(preOrderMetrics.openGrams / 1000).toFixed(1)} kg
              </div>
              <span className="text-[10px] text-slate-400">
                {preOrderMetrics.openCount} orders waiting for harvest batch
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Forfeited Deposit Income
              </span>
              <div className="text-xl font-extrabold text-emerald-700 mt-1">
                {formatTaka(preOrderMetrics.forfeitedIncome)}
              </div>
              <span className="text-[10px] text-slate-400">
                Recognized as Other Income in financial reports
              </span>
            </div>
          </div>
        )}

        {/* Section 1: Artisanal Production Costing Cards (Interactive White Theme) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Artisanal Unit Economics Simulator
            </h3>
            <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              LIVE MARGIN CALCULATOR
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Danadar Ghee (1 kg Jar) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Danadar Ghee (1 kg Jar)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Traditional Cow Butter Slow-Boil Method
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    Net Margin
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">
                    {gheeMargin}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Raw Butter Cost (৳ / kg):
                  </label>
                  <input
                    type="number"
                    value={gheeButterCost}
                    onChange={(e) => setGheeButterCost(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Boiling, Fuel & Labor (৳ / kg):
                  </label>
                  <input
                    type="number"
                    value={gheeLaborCost}
                    onChange={(e) => setGheeLaborCost(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Glass Jar, Seal & Label (৳):
                  </label>
                  <input
                    type="number"
                    value={gheeJarCost}
                    onChange={(e) => setGheeJarCost(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Retail Selling Price (৳):
                  </label>
                  <input
                    type="number"
                    value={gheeRetailPrice}
                    onChange={(e) => setGheeRetailPrice(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-orange-300 text-orange-950 font-mono font-bold rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total Production Cost:</span>
                  <span className="font-bold">{formatTaka(totalGheeCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Selling Price:</span>
                  <span className="font-bold">{formatTaka(gheeRetailPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  <span>Gross Profit per Jar:</span>
                  <span className="text-sm">{formatTaka(gheeProfit)}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Khejur Patali Gur (1 kg Block) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Khejur Patali Gur (1 kg Block)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Jashore Gachi Sap & Clay Oven Sourcing
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-semibold">
                    Net Margin
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">
                    {gurMargin}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Raw Date Palm Sap / Gachi Share (৳ / kg):
                  </label>
                  <input
                    type="number"
                    value={gurSapCost}
                    onChange={(e) => setGurSapCost(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Firewood & Boiling Labor (৳ / kg):
                  </label>
                  <input
                    type="number"
                    value={gurLaborCost}
                    onChange={(e) => setGurLaborCost(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Food Grade Packaging & Box (৳):
                  </label>
                  <input
                    type="number"
                    value={gurBoxCost}
                    onChange={(e) => setGurBoxCost(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Retail Selling Price (৳):
                  </label>
                  <input
                    type="number"
                    value={gurRetailPrice}
                    onChange={(e) => setGurRetailPrice(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-orange-300 text-orange-950 font-mono font-bold rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Total Production Cost:</span>
                  <span className="font-bold">{formatTaka(totalGurCost)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Selling Price:</span>
                  <span className="font-bold">{formatTaka(gurRetailPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                  <span>Gross Profit per Block:</span>
                  <span className="text-sm">{formatTaka(gurProfit)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Direct Costs & Operational Expenses Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Direct Operational Costs & Overhead
              </h3>
              <p className="text-xs text-slate-500">
                Logistics, packaging, firewood, and artisan wages
              </p>
            </div>
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
            >
              <FaPlus className="text-xs" />
              <span>Add Cost</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Reason / Particulars</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-mono">{formatAdminDate(exp.date)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-semibold text-[10px]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{exp.reason}</p>
                      {exp.notes && (
                        <p className="text-[10px] text-slate-400">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {exp.paymentMethod}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatTaka(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Live Batch Costing & Suggested Pricing Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Batch Costing & Suggested Selling Prices
              </h3>
              <p className="text-xs text-slate-500">
                Calculated strictly from received weight and target margin %
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search batch or product..."
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="depleted">Depleted</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Landed Cost / kg</th>
                  <th className="py-3 px-4">Total Cost</th>
                  <th className="py-3 px-4">Cost Remaining</th>
                  <th className="py-3 px-4">Suggested Pricing (Margin Target)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCosting.length > 0 ? (
                  filteredCosting.map((item) => (
                    <tr key={item.batchId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {item.batchNo}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatTaka(item.unitCostPerKg)}/kg
                      </td>
                      <td className="py-3 px-4">{formatTaka(item.totalCost)}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {formatTaka(item.costRemaining)}
                      </td>
                      <td className="py-3 px-4 space-y-1">
                        {item.suggestedPrices && item.suggestedPrices.length > 0 ? (
                          item.suggestedPrices.map((sp, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[11px]">
                              <span className="text-slate-600">{sp.label}:</span>
                              <span className="font-bold text-slate-900">
                                {formatTaka(sp.suggestedPrice)}
                              </span>
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">
                                {sp.marginPercent}% margin
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-400 italic">Standard catalog pricing</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No batch costing records available. Receive batches to see real-time unit costing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Direct Cost Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Add Direct Operational Cost
              </h3>
              <button
                onClick={() => setIsAddExpenseOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Expense Date *
                </label>
                <input
                  type="date"
                  required
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cost Category *
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="Raw Material">Raw Material (Butter, Date Sap)</option>
                  <option value="Processing & Fuel">Processing & Fuel (Firewood, Gas, Boiling)</option>
                  <option value="Packaging">Packaging (Glass Jars, Caps, Cartons)</option>
                  <option value="Labor">Labor & Artisan Wages</option>
                  <option value="Logistics">Logistics & Van Courier</option>
                  <option value="Marketing">Marketing & Photography</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason / Particulars *
                </label>
                <input
                  type="text"
                  required
                  value={expenseReason}
                  onChange={(e) => setExpenseReason(e.target.value)}
                  placeholder="e.g. 500 pcs Glass Jar & Gold Caps"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="e.g. 3500"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expensePaymentMethod}
                    onChange={(e) => setExpensePaymentMethod(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="Cash">Cash in Hand</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Notes
                </label>
                <input
                  type="text"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="e.g. Memo # 418 from Chawkbazar"
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

