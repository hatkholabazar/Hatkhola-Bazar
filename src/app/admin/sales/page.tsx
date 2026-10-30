"use client";

import { useState, useEffect } from "react";
import {
  FaCashRegister,
  FaPlus,
  FaSearch,
  FaBan,
  FaUndoAlt,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaWhatsapp,
  FaLayerGroup,
  FaTruck,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import PathaoDispatchModal from "@/components/admin/PathaoDispatchModal";
import {
  adminApi,
  ISale,
  IAdminProduct,
} from "@/lib/admin-api";
import {
  ADMIN_LABELS,
  formatTaka,
  formatGramsToKg,
  formatAdminDate,
} from "@/config/admin-labels";

export default function AdminSalesPage() {
  const [sales, setSales] = useState<ISale[]>([]);
  const [products, setProducts] = useState<IAdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [isAddSaleOpen, setIsAddSaleOpen] = useState(false);
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<ISale | null>(null);
  const [selectedSaleForPathao, setSelectedSaleForPathao] = useState<ISale | null>(null);

  // New Sale Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [courierName, setCourierName] = useState("Steadfast");
  const [courierCharge, setCourierCharge] = useState("120");
  const [courierTrackingId, setCourierTrackingId] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [salesChannel, setSalesChannel] = useState("phone");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [paymentTrxId, setPaymentTrxId] = useState("");
  const [giveawayG, setGiveawayG] = useState("0");
  const [packagingCost, setPackagingCost] = useState("25");

  // Sale items
  const [selectedProductCode, setSelectedProductCode] = useState("GHEE");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("1 kg Glass Jar");
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(1400);

  // Allocation preview
  const [fifoPreview, setFifoPreview] = useState<any[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedSales, fetchedProducts] = await Promise.all([
        adminApi.getSales(),
        adminApi.getProducts(),
      ]);
      setSales(fetchedSales);
      setProducts(fetchedProducts);
      if (fetchedProducts.length > 0) {
        setSelectedProductCode(fetchedProducts[0].code);
      }
    } catch (err) {
      console.error("Error loading sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update item price & option label when product changes
  useEffect(() => {
    const prod = products.find((p) => p.code === selectedProductCode);
    if (prod && prod.sellingOptions.length > 0) {
      setSelectedOptionLabel(prod.sellingOptions[0].label);
      setItemPrice(prod.sellingOptions[0].sellingPrice);
    }
  }, [selectedProductCode, products]);

  // Handle option selection
  const handleOptionChange = (label: string) => {
    setSelectedOptionLabel(label);
    const prod = products.find((p) => p.code === selectedProductCode);
    const opt = prod?.sellingOptions.find((o) => o.label === label);
    if (opt) {
      setItemPrice(opt.sellingPrice);
    }
  };

  // Live FIFO Preview (Safe & graceful)
  useEffect(() => {
    let isCancelled = false;
    async function checkPreview() {
      if (!isAddSaleOpen) return;
      const prod = products.find((p) => p.code === selectedProductCode);
      const opt = prod?.sellingOptions.find((o) => o.label === selectedOptionLabel);
      if (!prod || !opt) return;

      const totalQtyG = opt.qtyG * itemQty;
      const numGiveaway = Math.round(Number(giveawayG) || 0);

      try {
        setPreviewError(null);
        const res = await adminApi.previewSaleAllocation({
          items: [
            {
              productId: prod._id || prod.code,
              qtyG: totalQtyG,
              sellingPrice: itemPrice * itemQty,
            },
          ],
          giveawayG: numGiveaway,
        });
        if (!isCancelled && res && res.allocations) {
          setFifoPreview(res.allocations);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setFifoPreview(null);
          if (err.message && err.message.toLowerCase().includes("stock")) {
            setPreviewError(err.message);
          }
        }
      }
    }

    const timer = setTimeout(checkPreview, 350);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    isAddSaleOpen,
    selectedProductCode,
    selectedOptionLabel,
    itemQty,
    itemPrice,
    giveawayG,
    products,
  ]);

  // Financial calculations
  const productSubtotal = itemPrice * itemQty;
  const numCourierCharge = Math.round(Number(courierCharge) || 0);
  const grandTotalPayable = productSubtotal + numCourierCharge;

  // Create Sale Handler
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.code === selectedProductCode);
    const opt = prod?.sellingOptions.find((o) => o.label === selectedOptionLabel);
    if (!prod || !opt) return;

    const totalQtyG = opt.qtyG * itemQty;
    const numGiveaway = Math.round(Number(giveawayG) || 0);
    const numPkg = Math.round(Number(packagingCost) || 0);

    setIsSubmitting(true);
    try {
      await adminApi.createSale({
        soldAt: new Date(),
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        customerAddress: customerAddress.trim() || undefined,
        courierName,
        courierCharge: numCourierCharge,
        courierTrackingId: courierTrackingId.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        paymentTrxId: paymentTrxId.trim() || undefined,
        channel: salesChannel,
        paymentMethod,
        items: [
          {
            productId: prod._id || prod.code,
            optionLabel: selectedOptionLabel,
            qtyG: totalQtyG,
            sellingPrice: productSubtotal,
          },
        ],
        giveawayG: numGiveaway,
        packagingCost: numPkg,
      });

      setIsAddSaleOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setCourierTrackingId("");
      setDeliveryNotes("");
      setPaymentTrxId("");
      setGiveawayG("0");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record sale.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Void Sale
  const handleVoidSale = async (saleId: string) => {
    const reason = window.prompt("Enter reason for voiding this sale (will restore stock via reversal):");
    if (!reason || !reason.trim()) return;

    try {
      await adminApi.voidSale(saleId, reason.trim());
      if (selectedSaleDetail) setSelectedSaleDetail(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to void sale.");
    }
  };

  // Return Item
  const handleReturnItem = async (saleId: string, itemId: string, maxQtyG: number) => {
    const qtyStr = window.prompt(`Enter returned weight in grams (max ${maxQtyG}g):`, String(maxQtyG));
    if (!qtyStr) return;
    const qtyG = Math.round(Number(qtyStr));
    if (qtyG <= 0 || qtyG > maxQtyG) {
      alert("Invalid return quantity.");
      return;
    }

    const reason = window.prompt("Enter return reason (e.g. Customer requested refund for seal issue):");
    if (!reason) return;

    try {
      await adminApi.returnSaleItem(saleId, itemId, qtyG, reason);
      if (selectedSaleDetail) setSelectedSaleDetail(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to process item return.");
    }
  };

  const filteredSales = sales.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const cName = (s.customerName || "").toLowerCase();
      const cPhone = (s.customerPhone || "").toLowerCase();
      const cAddr = (s.customerAddress || "").toLowerCase();
      const cTrk = (s.courierTrackingId || "").toLowerCase();
      return (
        cName.includes(q) ||
        cPhone.includes(q) ||
        cAddr.includes(q) ||
        cTrk.includes(q) ||
        s._id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Sales Finance & FIFO Ledger"
        subtitle="Automatic multi-batch deduction, courier logistics & exact zero-loss COGS"
        actions={
          <button
            onClick={() => setIsAddSaleOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
          >
            <FaCashRegister className="text-xs" />
            <span>Record Direct Customer Sale</span>
          </button>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer, phone, address, tracking #..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            >
              <option value="all">All Sales</option>
              <option value="completed">Completed</option>
              <option value="voided">Voided</option>
            </select>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer & Address</th>
                  <th className="py-3 px-4 whitespace-nowrap">Courier & Payment</th>
                  <th className="py-3 px-4 whitespace-nowrap">Items (Qty)</th>
                  <th className="py-3 px-4 whitespace-nowrap">Subtotal</th>
                  <th className="py-3 px-4 whitespace-nowrap">Courier Fee</th>
                  <th className="py-3 px-4 whitespace-nowrap">Total Payable</th>
                  <th className="py-3 px-4 whitespace-nowrap">Profit</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSales.length > 0 ? (
                  filteredSales.map((s) => {
                    const totalPayable = s.totalRevenue + (s.courierCharge || 0);

                    return (
                      <tr
                        key={s._id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          s.status === "voided" ? "opacity-60 bg-rose-50/20" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono">
                          {formatAdminDate(s.soldAt)}
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <p className="font-bold text-slate-900">
                            {s.customerName || "Direct Customer"}
                          </p>
                          {s.customerPhone && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-600 mt-0.5">
                              <FaWhatsapp className="text-[10px] text-emerald-600" />
                              <span className="font-mono">{s.customerPhone}</span>
                            </div>
                          )}
                          {s.customerAddress && (
                            <div className="flex items-start gap-1 text-[10px] text-slate-500 mt-0.5 truncate">
                              <FaMapMarkerAlt className="text-[9px] text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate">{s.customerAddress}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                              {s.courierName || s.channel}
                            </span>
                            {s.courierTrackingId && (
                              <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1 rounded border border-slate-200">
                                {s.courierTrackingId}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 capitalize">
                            {s.paymentMethod.replace(/_/g, " ")}
                            {s.paymentTrxId && ` (Trx: ${s.paymentTrxId})`}
                          </p>
                        </td>
                        <td className="py-3 px-4 space-y-0.5">
                          {s.items.map((i, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-800">
                                {i.optionLabel}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({formatGramsToKg(i.qtyG)})
                              </span>
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {formatTaka(s.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {formatTaka(s.courierCharge || 0)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                          {formatTaka(totalPayable)}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          +{formatTaka(s.grossProfit)}
                        </td>
                        <td className="py-3 px-4">
                          {s.status === "completed" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FaCheckCircle className="text-[8px]" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <FaBan className="text-[8px]" /> Voided
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {s.status === "completed" && (
                              s.courierTrackingId ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                                  <FaTruck className="text-[9px]" /> {s.courierTrackingId}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSaleForPathao(s)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-200 transition-colors"
                                  title="Dispatch order via Pathao Courier"
                                >
                                  <FaTruck className="text-[10px]" /> Pathao
                                </button>
                              )
                            )}
                            <button
                              onClick={() => setSelectedSaleDetail(s)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                            >
                              <FaEye className="text-[10px]" /> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-400">
                      No sales recorded yet. Click &ldquo;Record Direct Customer Sale&rdquo; to begin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Record New Sale (Comprehensive 2-Column Layout) */}
      {isAddSaleOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Record Direct Customer Sale
                </h3>
                <p className="text-xs text-slate-500">
                  Complete customer address, manual courier charge, tracking ID & real-time FIFO stock deduction
                </p>
              </div>
              <button
                onClick={() => setIsAddSaleOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* 2-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Customer & Delivery Logistics */}
                  <div className="space-y-3.5">
                    {/* Customer Personal Details */}
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FaPhoneAlt className="text-slate-400 text-[10px]" />
                        <span>Customer Information</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Customer Name
                          </label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. Tanvir Ahmed"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Mobile / WhatsApp Number *
                          </label>
                          <input
                            type="text"
                            required
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="e.g. 01819223344"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Full Delivery Address *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="e.g. House 14, Road 5, Block B, Dhanmondi, Dhaka"
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    </div>

                    {/* Courier Logistics & Manual Delivery Charge */}
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FaTruck className="text-slate-400 text-xs" />
                        <span>Courier Delivery Logistics</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Courier Service
                          </label>
                          <select
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          >
                            {ADMIN_LABELS.couriers.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Manual Courier Charge (৳)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={courierCharge}
                            onChange={(e) => setCourierCharge(e.target.value)}
                            placeholder="e.g. 120"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-orange-950"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Consignment / Tracking ID
                          </label>
                          <input
                            type="text"
                            value={courierTrackingId}
                            onChange={(e) => setCourierTrackingId(e.target.value)}
                            placeholder="e.g. STFD-89412"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Order Channel
                          </label>
                          <select
                            value={salesChannel}
                            onChange={(e) => setSalesChannel(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          >
                            {ADMIN_LABELS.salesChannels.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Special Delivery Instructions / Note
                        </label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="e.g. Fragile glass jar, call before delivery"
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Product, Pricing & Payment */}
                  <div className="space-y-3.5">
                    {/* Payment Method & TrxID */}
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FaReceipt className="text-slate-400 text-xs" />
                        <span>Payment & Settlement</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Payment Method
                          </label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          >
                            {ADMIN_LABELS.paymentMethods.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Payment TrxID (If Paid)
                          </label>
                          <input
                            type="text"
                            value={paymentTrxId}
                            onChange={(e) => setPaymentTrxId(e.target.value)}
                            placeholder="e.g. 9X8A1B (bKash/Nagad)"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Product & Variant */}
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Product & Packaging
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Product
                          </label>
                          <select
                            value={selectedProductCode}
                            onChange={(e) => setSelectedProductCode(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          >
                            {products.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Packaging Variant
                          </label>
                          <select
                            value={selectedOptionLabel}
                            onChange={(e) => handleOptionChange(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          >
                            {products
                              .find((p) => p.code === selectedProductCode)
                              ?.sellingOptions.map((opt) => (
                                <option key={opt.label} value={opt.label}>
                                  {opt.label} ({opt.qtyG}g)
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                            Units
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={itemQty}
                            onChange={(e) => setItemQty(Math.max(1, Number(e.target.value)))}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                            Unit Price (৳)
                          </label>
                          <input
                            type="number"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(Number(e.target.value))}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                            Giveaway (g)
                          </label>
                          <input
                            type="number"
                            value={giveawayG}
                            onChange={(e) => setGiveawayG(e.target.value)}
                            placeholder="0"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Financial Summary Box */}
                    <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200/80 text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-700">
                        <span>Items Subtotal:</span>
                        <span className="font-bold">{formatTaka(productSubtotal)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span>Courier Delivery Fee:</span>
                        <span className="font-mono font-bold text-orange-900">
                          +{formatTaka(numCourierCharge)}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-1.5 border-t border-orange-200">
                        <span>Total Payable by Customer:</span>
                        <span className="text-orange-700">{formatTaka(grandTotalPayable)}</span>
                      </div>
                    </div>

                    {/* FIFO Allocation Preview */}
                    {previewError ? (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                        <FaExclamationTriangle className="text-rose-500 shrink-0" />
                        <span>{previewError}</span>
                      </div>
                    ) : fifoPreview && fifoPreview.length > 0 ? (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                          <FaLayerGroup className="text-emerald-600 text-xs" />
                          <span>FIFO Batch Allocation Preview</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          {fifoPreview.map((al, idx) => (
                            <div key={idx} className="flex justify-between font-mono text-emerald-800 text-[11px]">
                              <span>Batch: <strong>{al.batchNo}</strong></span>
                              <span>{formatGramsToKg(al.qtyG)} • Cost: {formatTaka(al.cost)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-between">
                <div className="text-xs text-slate-600">
                  <span>Subtotal: <strong>{formatTaka(productSubtotal)}</strong></span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span>Delivery: <strong>{formatTaka(numCourierCharge)}</strong></span>
                  <span className="mx-2 text-slate-300">•</span>
                  <span className="text-slate-900 font-bold">Total: {formatTaka(grandTotalPayable)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddSaleOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || Boolean(previewError)}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Deducting Stock..." : "Confirm & Save Sale"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Sale Detail & Batch Allocations */}
      {selectedSaleDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sale Ledger Entry #{selectedSaleDetail._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-slate-500">
                  {formatAdminDate(selectedSaleDetail.soldAt)} • Channel: {selectedSaleDetail.channel}
                </p>
              </div>
              <button
                onClick={() => setSelectedSaleDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            {/* Customer & Courier Details */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-900">
                  {selectedSaleDetail.customerName || "Walk-in Customer"}
                </span>
              </div>
              {selectedSaleDetail.customerPhone && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile Phone:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedSaleDetail.customerPhone}
                  </span>
                </div>
              )}
              {selectedSaleDetail.customerAddress && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Delivery Address:</span>
                  <p className="font-medium text-slate-800 bg-white p-2 rounded border border-slate-200">
                    {selectedSaleDetail.customerAddress}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] block">Courier Partner:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedSaleDetail.courierName || "Local Delivery"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Courier Fee:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatTaka(selectedSaleDetail.courierCharge || 0)}
                  </span>
                </div>
              </div>
              {selectedSaleDetail.courierTrackingId && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Tracking / Consignment #:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedSaleDetail.courierTrackingId}
                  </span>
                </div>
              )}
              {selectedSaleDetail.paymentTrxId && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Payment TrxID:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedSaleDetail.paymentTrxId}
                  </span>
                </div>
              )}
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">Product Subtotal</span>
                <p className="font-bold text-slate-900">
                  {formatTaka(selectedSaleDetail.totalRevenue)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Total Payable</span>
                <p className="font-bold text-slate-900">
                  {formatTaka(selectedSaleDetail.totalRevenue + (selectedSaleDetail.courierCharge || 0))}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Gross Profit</span>
                <p className="font-bold text-emerald-600">
                  +{formatTaka(selectedSaleDetail.grossProfit)}
                </p>
              </div>
            </div>

            {/* Exact Batch Allocations */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Allocated Batches (FIFO Traceability)
              </h4>
              <div className="space-y-3">
                {selectedSaleDetail.items.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3 text-xs bg-white">
                    <div className="flex justify-between font-bold text-slate-800 mb-1">
                      <span>{item.optionLabel}</span>
                      <span>{formatTaka(item.sellingPrice)}</span>
                    </div>

                    <div className="mt-2 space-y-1">
                      {item.allocations && item.allocations.length > 0 ? (
                        item.allocations.map((al, aIdx) => (
                          <div
                            key={aIdx}
                            className="flex justify-between items-center text-[11px] font-mono bg-slate-50 px-2 py-1 rounded"
                          >
                            <span className="text-slate-700">
                              Batch: <strong>{al.batchNo}</strong>
                            </span>
                            <span className="text-slate-600">
                              {formatGramsToKg(al.qtyG)} • COGS: {formatTaka(al.cost)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No allocations recorded</span>
                      )}
                    </div>

                    {selectedSaleDetail.status === "completed" && item._id && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            handleReturnItem(selectedSaleDetail._id, item._id!, item.qtyG)
                          }
                          className="text-[11px] font-semibold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                        >
                          <FaUndoAlt className="text-[9px]" /> Return Item to Stock
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {selectedSaleDetail.status === "completed" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleVoidSale(selectedSaleDetail._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                    >
                      Void Sale & Restore Stock
                    </button>
                    {!selectedSaleDetail.courierTrackingId && (
                      <button
                        type="button"
                        onClick={() => {
                          const target = selectedSaleDetail;
                          setSelectedSaleDetail(null);
                          setSelectedSaleForPathao(target);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 flex items-center gap-1.5 shadow-xs"
                      >
                        <FaTruck className="text-xs" /> Send to Pathao
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-rose-600 font-bold">
                    Sale is VOIDED (stock restored to batches)
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedSaleDetail(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pathao Dispatch Review Modal */}
      <PathaoDispatchModal
        isOpen={Boolean(selectedSaleForPathao)}
        onClose={() => setSelectedSaleForPathao(null)}
        onSuccess={() => {
          loadData();
          setSelectedSaleForPathao(null);
        }}
        orderType="sale"
        order={selectedSaleForPathao}
      />
    </div>
  );
}
