"use client";

import { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaPlus,
  FaSearch,
  FaWhatsapp,
  FaCheckCircle,
  FaTimes,
  FaClock,
  FaBoxes,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCopy,
  FaShareAlt,
  FaReceipt,
  FaTruck,
  FaCalendarAlt,
  FaFilter,
  FaLayerGroup,
  FaBan,
  FaUndoAlt,
  FaCheck,
  FaExternalLinkAlt,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import PathaoDispatchModal from "@/components/admin/PathaoDispatchModal";
import {
  adminApi,
  IPreOrder,
  IPreOrderMetrics,
  IAdminProduct,
  IStockBatch,
} from "@/lib/admin-api";
import { formatTaka, formatGramsToKg, kgToGrams } from "@/config/admin-labels";

export default function AdminPreOrdersPage() {
  const [preOrders, setPreOrders] = useState<IPreOrder[]>([]);
  const [metrics, setMetrics] = useState<IPreOrderMetrics | null>(null);
  const [products, setProducts] = useState<IAdminProduct[]>([]);
  const [batches, setBatches] = useState<IStockBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Drawer State
  const [selectedPreOrder, setSelectedPreOrder] = useState<IPreOrder | null>(null);
  const [selectedPreOrderForPathao, setSelectedPreOrderForPathao] = useState<IPreOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Create Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [channel, setChannel] = useState<string>("whatsapp");
  const [address, setAddress] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedOptionLabel, setSelectedOptionLabel] = useState("");
  const [orderQtyKg, setOrderQtyKg] = useState("1");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [note, setNote] = useState("");
  const [initialDepositAmount, setInitialDepositAmount] = useState("");
  const [initialDepositMethod, setInitialDepositMethod] = useState<string>("bkash");
  const [initialDepositTrxId, setInitialDepositTrxId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit Form State (Inside Drawer)
  const [depositAmountInput, setDepositAmountInput] = useState("");
  const [depositMethodInput, setDepositMethodInput] = useState<string>("bkash");
  const [depositTrxInput, setDepositTrxInput] = useState("");
  const [isAddingDeposit, setIsAddingDeposit] = useState(false);

  // Fulfilment Form State (Inside Drawer)
  const [courierName, setCourierName] = useState("Steadfast");
  const [courierCharge, setCourierCharge] = useState("100");
  const [courierTrackingId, setCourierTrackingId] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isFulfilling, setIsFulfilling] = useState(false);

  // Cancellation Form State (Inside Drawer)
  const [cancelReason, setCancelReason] = useState("");
  const [refundType, setRefundType] = useState<string>("full_refund");
  const [partialRefundAmount, setPartialRefundAmount] = useState("");
  const [partialForfeitAmount, setPartialForfeitAmount] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Copy confirmation state
  const [copied, setCopied] = useState(false);

  // Load all initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [poRes, metRes, prodRes, batchRes] = await Promise.all([
        adminApi.getPreOrders({
          status: statusFilter,
          productId: productFilter,
          search: searchTerm,
        }),
        adminApi.getPreOrderMetrics(),
        adminApi.getProducts(),
        adminApi.getBatches(),
      ]);

      setPreOrders(poRes.preOrders);
      setMetrics(metRes);
      setProducts(prodRes);
      setBatches(batchRes.filter((b) => b.status === "active"));
    } catch (err) {
      console.error("Error loading pre-order data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, productFilter]);

  // Handle Search on Enter or debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Open Drawer with Pre-order Detail
  const handleOpenDrawer = async (po: IPreOrder) => {
    setSelectedPreOrder(po);
    setIsDrawerOpen(true);
    // Reset inline action forms
    setIsAddingDeposit(false);
    setIsFulfilling(false);
    setIsCancelling(false);
    setDepositAmountInput("");
    setCourierTrackingId("");
    setCancelReason("");
    setPartialRefundAmount(String(po.depositTotal));
    setPartialForfeitAmount("0");
    setCopied(false);
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setCustomerName("");
    setCustomerPhone("");
    setChannel("whatsapp");
    setAddress("");
    setOrderQtyKg("1");
    setNote("");
    setInitialDepositAmount("");
    setInitialDepositTrxId("");
    setFormError(null);

    // Pick first pre_order product if available
    const preOrderProds = products.filter((p) => p.availabilityMode === "pre_order");
    if (preOrderProds.length > 0) {
      const first = preOrderProds[0];
      setSelectedProductId(first._id || first.code);
      if (first.sellingOptions && first.sellingOptions.length > 0) {
        setSelectedOptionLabel(first.sellingOptions[0].label);
        setOrderQtyKg(String(first.sellingOptions[0].qtyG / 1000));
        setQuotedPrice(String(first.sellingOptions[0].sellingPrice));
      }
      if (first.preOrder?.depositRequired && first.preOrder?.depositAmount) {
        setInitialDepositAmount(String(first.preOrder.depositAmount));
      }
      if (first.preOrder?.expectedDate) {
        setExpectedDate(new Date(first.preOrder.expectedDate).toISOString().slice(0, 10));
      }
    } else if (products.length > 0) {
      setSelectedProductId(products[0]._id || products[0].code);
    }

    setIsCreateModalOpen(true);
  };

  // On selecting product in Create form
  const handleProductChange = (pId: string) => {
    setSelectedProductId(pId);
    const prod = products.find((p) => (p._id || p.code) === pId);
    if (prod && prod.sellingOptions && prod.sellingOptions.length > 0) {
      const opt = prod.sellingOptions[0];
      setSelectedOptionLabel(opt.label);
      setOrderQtyKg(String(opt.qtyG / 1000));
      setQuotedPrice(String(opt.sellingPrice));
    }
    if (prod?.preOrder?.depositRequired && prod?.preOrder?.depositAmount) {
      setInitialDepositAmount(String(prod.preOrder.depositAmount));
    }
  };

  // On selecting option in Create form
  const handleOptionChange = (optLabel: string) => {
    setSelectedOptionLabel(optLabel);
    const prod = products.find((p) => (p._id || p.code) === selectedProductId);
    if (prod && prod.sellingOptions) {
      const opt = prod.sellingOptions.find((o) => o.label === optLabel);
      if (opt) {
        setOrderQtyKg(String(opt.qtyG / 1000));
        setQuotedPrice(String(opt.sellingPrice));
      }
    }
  };

  // Submit New Pre-Order
  const handleCreatePreOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim() || !customerPhone.trim()) {
      setFormError("Customer Name and Phone are required.");
      return;
    }
    if (!selectedProductId) {
      setFormError("Please select a product.");
      return;
    }

    const qtyG = kgToGrams(orderQtyKg);
    const price = Math.round(Number(quotedPrice) || 0);
    if (qtyG <= 0 || price <= 0) {
      setFormError("Quantity and Quoted Price must be positive.");
      return;
    }

    const payload: any = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      channel,
      address: address.trim() || undefined,
      items: [
        {
          productId: selectedProductId,
          optionLabel: selectedOptionLabel || `${orderQtyKg} kg`,
          qtyG,
          quotedPrice: price,
        },
      ],
      expectedDate: expectedDate ? expectedDate : undefined,
      note: note.trim() || undefined,
    };

    if (Number(initialDepositAmount) > 0) {
      payload.deposit = {
        amount: Math.round(Number(initialDepositAmount)),
        method: initialDepositMethod,
        trxId: initialDepositTrxId.trim() || undefined,
      };
    }

    setIsSubmitting(true);
    try {
      await adminApi.createPreOrder(payload);
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to create pre-order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add Deposit from Drawer
  const handleAddDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreOrder) return;

    const amount = Math.round(Number(depositAmountInput) || 0);
    if (amount <= 0) {
      alert("Deposit amount must be greater than 0");
      return;
    }

    try {
      const updated = await adminApi.addPreOrderDeposit(selectedPreOrder._id, {
        amount,
        method: depositMethodInput,
        trxId: depositTrxInput.trim() || undefined,
      });
      setSelectedPreOrder(updated);
      setIsAddingDeposit(false);
      setDepositAmountInput("");
      setDepositTrxInput("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to record deposit");
    }
  };

  // Allocate Batch from Drawer
  const handleAllocateBatch = async (batchId: string) => {
    if (!selectedPreOrder) return;
    try {
      const updated = await adminApi.allocateBatchToPreOrder(selectedPreOrder._id, batchId);
      setSelectedPreOrder(updated);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to allocate batch");
    }
  };

  // Fulfil Pre-Order from Drawer
  const handleFulfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreOrder) return;

    try {
      const result = await adminApi.fulfilPreOrder(selectedPreOrder._id, {
        customerAddress: selectedPreOrder.address,
        courierName,
        courierCharge: Math.round(Number(courierCharge) || 0),
        courierTrackingId: courierTrackingId.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
      });

      setSelectedPreOrder(result.preOrder);
      setIsFulfilling(false);
      alert(
        `Pre-order ${result.preOrder.preOrderNo} fulfilled successfully! Sale ID: ${result.sale._id}`
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to fulfil pre-order");
    }
  };

  // Cancel Pre-Order from Drawer
  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPreOrder) return;

    if (!cancelReason.trim()) {
      alert("Cancellation reason is required");
      return;
    }

    try {
      const payload: any = {
        reason: cancelReason.trim(),
        refundType,
      };
      if (refundType === "partial_refund") {
        payload.refundAmount = Math.round(Number(partialRefundAmount) || 0);
        payload.forfeitAmount = Math.round(Number(partialForfeitAmount) || 0);
      }

      const updated = await adminApi.cancelPreOrder(selectedPreOrder._id, payload);
      setSelectedPreOrder(updated);
      setIsCancelling(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel pre-order");
    }
  };

  // Copy Confirmation Message
  const handleCopyConfirmation = () => {
    if (!selectedPreOrder) return;

    const itemsStr = selectedPreOrder.items
      .map((it) => `- ${it.productName} (${it.optionLabel}): ৳${it.quotedPrice}`)
      .join("\n");

    const balanceDue = Math.max(
      0,
      selectedPreOrder.quotedTotal - selectedPreOrder.depositTotal
    );

    const msg = `*Hatkhola-Bazar Pre-Order Confirmation*
Pre-Order No: ${selectedPreOrder.preOrderNo}
Customer: ${selectedPreOrder.customerName}
Phone: ${selectedPreOrder.customerPhone}

Items:
${itemsStr}

Total Quoted: ৳${selectedPreOrder.quotedTotal}
Deposit Received: ৳${selectedPreOrder.depositTotal}
Balance Due on Delivery: ৳${balanceDue}
${selectedPreOrder.expectedDate ? `Expected Date: ${new Date(selectedPreOrder.expectedDate).toLocaleDateString()}` : ""}

Thank you for choosing artisanal authenticity!`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Get WhatsApp URL
  const getWhatsAppUrl = (po: IPreOrder) => {
    const cleanPhone = po.customerPhone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.startsWith("88")
      ? cleanPhone
      : cleanPhone.startsWith("0")
      ? `88${cleanPhone}`
      : `880${cleanPhone}`;

    const text =
      po.status === "ready"
        ? `Hi ${po.customerName}, your Hatkhola-Bazar pre-order (${po.preOrderNo}) is now FRESHLY PACKED & READY for dispatch! Balance due: ৳${Math.max(0, po.quotedTotal - po.depositTotal)}. Please confirm your delivery address.`
        : `Hi ${po.customerName}, your pre-order (${po.preOrderNo}) with Hatkhola-Bazar is confirmed! We have recorded your deposit of ৳${po.depositTotal}.`;

    return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Pre-Orders & Advance Demand"
        subtitle="Manage seasonal advance demand, customer deposit liabilities, FIFO batch linking & WhatsApp notifications"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <FaPlus className="text-xs" />
            <span>New Pre-Order</span>
          </button>
        }
      />

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Top 4 Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Open Pre-Orders
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {metrics.openCount}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Pending, Confirmed, Ready</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
                <FaClipboardList />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Total Demand Weight
                </p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {(metrics.openGrams / 1000).toFixed(1)} kg
                </h3>
                <p className="text-[11px] text-amber-600 font-semibold mt-0.5">
                  Advance committed demand
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg">
                <FaBoxes />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Deposits Held (Liability)
                </p>
                <h3 className="text-2xl font-extrabold text-blue-700 mt-1">
                  {formatTaka(metrics.depositsHeld)}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Excluded from revenue</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
                <FaMoneyBillWave />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Harvest Stock Shortfall
                </p>
                <h3 className="text-2xl font-extrabold text-rose-600 mt-1">
                  {(
                    metrics.productDemands.reduce((acc, p) => acc + p.shortfallGrams, 0) /
                    1000
                  ).toFixed(1)}{" "}
                  kg
                </h3>
                <p className="text-[11px] text-rose-700 font-medium mt-0.5">
                  Demand exceeding stock
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
                <FaExclamationTriangle />
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "confirmed", label: "Confirmed" },
                { id: "ready", label: "Ready" },
                { id: "fulfilled", label: "Fulfilled" },
                { id: "cancelled", label: "Cancelled" },
                { id: "refunded", label: "Refunded" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    statusFilter === tab.id
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Product Filter & Search */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700"
              >
                <option value="all">All Products</option>
                {products.map((p) => (
                  <option key={p.code} value={p._id || p.code}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>

              <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Order #, name, phone..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </form>
            </div>
          </div>
        </div>

        {/* Pre-Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Pre-Order #</th>
                  <th className="py-3 px-4 whitespace-nowrap">Customer & Channel</th>
                  <th className="py-3 px-4 whitespace-nowrap">Items & Demand</th>
                  <th className="py-3 px-4 whitespace-nowrap">Quoted Total</th>
                  <th className="py-3 px-4 whitespace-nowrap">Deposit Held</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 whitespace-nowrap">Expected Date</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Loading pre-orders ledger...
                    </td>
                  </tr>
                ) : preOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No pre-orders found matching current filters.
                    </td>
                  </tr>
                ) : (
                  preOrders.map((po) => {
                    const balanceDue = Math.max(0, po.quotedTotal - po.depositTotal);

                    return (
                      <tr
                        key={po._id}
                        className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => handleOpenDrawer(po)}
                      >
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-orange-900 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                            {po.preOrderNo}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{po.customerName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {po.customerPhone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            {po.items.map((it, idx) => (
                              <div key={idx} className="font-medium text-slate-800">
                                {it.productName} ({it.optionLabel})
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatTaka(po.quotedTotal)}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`font-bold ${
                              po.depositTotal > 0 ? "text-blue-700" : "text-slate-400"
                            }`}
                          >
                            {formatTaka(po.depositTotal)}
                          </span>
                          {balanceDue > 0 && po.status !== "fulfilled" && (
                            <span className="block text-[10px] text-slate-400">
                              Due: {formatTaka(balanceDue)}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              po.status === "confirmed"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : po.status === "ready"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : po.status === "fulfilled"
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : po.status === "cancelled"
                                ? "bg-rose-100 text-rose-800 border border-rose-200"
                                : po.status === "refunded"
                                ? "bg-slate-200 text-slate-700"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600">
                          {po.expectedDate
                            ? new Date(po.expectedDate).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {(po.status === "confirmed" || po.status === "ready") && (
                              <button
                                type="button"
                                onClick={() => setSelectedPreOrderForPathao(po)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] border border-red-200 transition-colors"
                                title="Dispatch order via Pathao Courier"
                              >
                                <FaTruck className="text-[10px]" /> Pathao
                              </button>
                            )}
                            <a
                              href={getWhatsAppUrl(po)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="Message customer on WhatsApp"
                            >
                              <FaWhatsapp className="text-sm" />
                            </a>
                            <button
                              onClick={() => handleOpenDrawer(po)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition-colors"
                            >
                              Details
                            </button>
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
      </div>

      {/* Slide-over Detail Drawer */}
      {isDrawerOpen && selectedPreOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-orange-950">
                    {selectedPreOrder.preOrderNo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      selectedPreOrder.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : selectedPreOrder.status === "ready"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedPreOrder.status === "fulfilled"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {selectedPreOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered on {new Date(selectedPreOrder.createdAt).toLocaleDateString()} via{" "}
                  {selectedPreOrder.channel}
                </p>
              </div>

              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* Customer Info Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      {selectedPreOrder.customerName}
                    </h4>
                    <p className="font-mono text-slate-600 text-xs">
                      {selectedPreOrder.customerPhone}
                    </p>
                    {selectedPreOrder.address && (
                      <p className="text-slate-500 text-xs mt-1">
                        Address: {selectedPreOrder.address}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppUrl(selectedPreOrder)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors"
                    >
                      <FaWhatsapp className="text-sm" />
                      <span>WhatsApp</span>
                    </a>
                    <button
                      onClick={handleCopyConfirmation}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-2xs transition-colors"
                    >
                      {copied ? <FaCheck className="text-emerald-600" /> : <FaCopy />}
                      <span>{copied ? "Copied" : "Copy Slip"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Card */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                  Ordered Items & Demand
                </h4>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedPreOrder.items.map((it, idx) => (
                    <div key={idx} className="p-3 bg-white flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-900">{it.productName}</span>
                        <span className="text-slate-500 block text-[11px]">
                          {it.optionLabel} ({it.qtyG}g)
                        </span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {formatTaka(it.quotedPrice)}
                      </span>
                    </div>
                  ))}
                  <div className="p-3 bg-slate-50 flex justify-between font-bold text-xs">
                    <span>Quoted Total</span>
                    <span>{formatTaka(selectedPreOrder.quotedTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Deposits & Liabilities Ledger */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                    Customer Deposit Liability
                  </h4>
                  {selectedPreOrder.status !== "fulfilled" &&
                    selectedPreOrder.status !== "cancelled" && (
                      <button
                        onClick={() => setIsAddingDeposit(!isAddingDeposit)}
                        className="text-blue-600 hover:text-blue-800 font-bold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FaPlus className="text-[10px]" /> Add Deposit
                      </button>
                    )}
                </div>

                {isAddingDeposit && (
                  <form
                    onSubmit={handleAddDepositSubmit}
                    className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2.5"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-blue-900 mb-0.5">
                          Amount (৳) *
                        </label>
                        <input
                          type="number"
                          required
                          value={depositAmountInput}
                          onChange={(e) => setDepositAmountInput(e.target.value)}
                          placeholder="e.g. 500"
                          className="w-full bg-white border border-blue-300 rounded p-1.5 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-blue-900 mb-0.5">
                          Method *
                        </label>
                        <select
                          value={depositMethodInput}
                          onChange={(e) => setDepositMethodInput(e.target.value)}
                          className="w-full bg-white border border-blue-300 rounded p-1.5"
                        >
                          <option value="bkash">bKash</option>
                          <option value="nagad">Nagad</option>
                          <option value="bank">Bank Transfer</option>
                          <option value="cash">Cash Advance</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-900 mb-0.5">
                        Transaction ID (TrxID)
                      </label>
                      <input
                        type="text"
                        value={depositTrxInput}
                        onChange={(e) => setDepositTrxInput(e.target.value)}
                        placeholder="e.g. 9J29KSM1"
                        className="w-full bg-white border border-blue-300 rounded p-1.5 font-mono"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingDeposit(false)}
                        className="px-2.5 py-1 text-xs text-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-600 text-white rounded font-bold text-xs"
                      >
                        Save Deposit
                      </button>
                    </div>
                  </form>
                )}

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Total Deposit Held:</span>
                    <span className="font-bold text-blue-700 text-sm">
                      {formatTaka(selectedPreOrder.depositTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Balance Due on Dispatch:</span>
                    <span className="font-bold text-slate-900">
                      {formatTaka(
                        Math.max(
                          0,
                          selectedPreOrder.quotedTotal - selectedPreOrder.depositTotal
                        )
                      )}
                    </span>
                  </div>

                  {selectedPreOrder.deposits.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 space-y-1">
                      {selectedPreOrder.deposits.map((dep, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-[11px] text-slate-500"
                        >
                          <span>
                            ৳{dep.amount} via {dep.method}{" "}
                            {dep.trxId && `(Trx: ${dep.trxId})`}
                          </span>
                          <span>{new Date(dep.receivedAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fulfilment Section (if ready or confirmed) */}
              {(selectedPreOrder.status === "confirmed" ||
                selectedPreOrder.status === "ready" ||
                selectedPreOrder.status === "pending") && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider">
                        FIFO Fulfilment & Dispatch
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Allocates live stock, deducts deposit & generates Sale
                      </p>
                    </div>

                    {!isFulfilling && (
                      <button
                        onClick={() => setIsFulfilling(true)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
                      >
                        Fulfil Pre-Order
                      </button>
                    )}
                  </div>

                  {isFulfilling && (
                    <form onSubmit={handleFulfilSubmit} className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">
                            Courier Service
                          </label>
                          <select
                            value={courierName}
                            onChange={(e) => setCourierName(e.target.value)}
                            className="w-full bg-white border border-emerald-300 rounded p-1.5"
                          >
                            <option value="Steadfast">Steadfast Courier</option>
                            <option value="Pathao">Pathao Courier</option>
                            <option value="RedX">RedX Delivery</option>
                            <option value="Sundarban">Sundarban Courier</option>
                            <option value="SA Paribahan">SA Paribahan</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">
                            Courier Charge (৳)
                          </label>
                          <input
                            type="number"
                            value={courierCharge}
                            onChange={(e) => setCourierCharge(e.target.value)}
                            className="w-full bg-white border border-emerald-300 rounded p-1.5 font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-emerald-900 mb-0.5">
                          Consignment / Tracking ID
                        </label>
                        <input
                          type="text"
                          value={courierTrackingId}
                          onChange={(e) => setCourierTrackingId(e.target.value)}
                          placeholder="e.g. STFD-98412"
                          className="w-full bg-white border border-emerald-300 rounded p-1.5 font-mono"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsFulfilling(false)}
                          className="px-3 py-1 text-slate-600 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-xs"
                        >
                          Confirm & Deduct Stock
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Status Audit Timeline */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                  Status History & Audit
                </h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                  {selectedPreOrder.statusHistory.map((hist, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-orange-500 mt-1 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-800 capitalize">
                            {hist.status}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(hist.changedAt).toLocaleString()}
                          </span>
                        </div>
                        {hist.note && <p className="text-slate-500 text-[11px]">{hist.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancellation & Refund Action */}
              {selectedPreOrder.status !== "fulfilled" &&
                selectedPreOrder.status !== "cancelled" &&
                selectedPreOrder.status !== "refunded" && (
                  <div className="pt-2">
                    {!isCancelling ? (
                      <button
                        onClick={() => setIsCancelling(true)}
                        className="text-rose-600 hover:text-rose-800 font-semibold text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FaBan className="text-xs" />
                        <span>Cancel or Refund Pre-Order</span>
                      </button>
                    ) : (
                      <form
                        onSubmit={handleCancelSubmit}
                        className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3"
                      >
                        <h4 className="font-bold text-xs text-rose-950 uppercase">
                          Cancel Pre-Order & Process Deposit
                        </h4>
                        <div>
                          <label className="block text-[10px] font-bold text-rose-900 mb-0.5">
                            Cancellation Reason *
                          </label>
                          <input
                            type="text"
                            required
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            placeholder="e.g. Customer cancelled 48h prior"
                            className="w-full bg-white border border-rose-300 rounded p-1.5"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-rose-900 mb-0.5">
                            Deposit Treatment
                          </label>
                          <select
                            value={refundType}
                            onChange={(e) => setRefundType(e.target.value)}
                            className="w-full bg-white border border-rose-300 rounded p-1.5"
                          >
                            <option value="full_refund">
                              100% Full Refund (৳{selectedPreOrder.depositTotal})
                            </option>
                            <option value="forfeit">
                              Forfeit Deposit (Count ৳{selectedPreOrder.depositTotal} as Other Income)
                            </option>
                            <option value="partial_refund">Split Refund & Forfeit</option>
                            <option value="none">No Deposit / Zero Net</option>
                          </select>
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setIsCancelling(false)}
                            className="px-3 py-1 text-slate-600 text-xs"
                          >
                            Back
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg shadow-xs"
                          >
                            Confirm Cancellation
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* New Pre-Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record New Customer Pre-Order</h3>
                <p className="text-xs text-slate-500">
                  Pre-orders do NOT deduct inventory and do NOT record revenue until fulfilment
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleCreatePreOrderSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <FaExclamationTriangle className="text-rose-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Customer Details */}
                <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Customer Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Tanvir Ahmed"
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="e.g. 01819223344"
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Order Channel
                      </label>
                      <select
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="messenger">Facebook Messenger</option>
                        <option value="phone">Phone Call</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Delivery Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. House 12, Road 4, Banani, Dhaka"
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Product & Quoted Pricing */}
                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Product & Quoted Demand
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Product *
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => handleProductChange(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-bold"
                      >
                        {products.map((p) => (
                          <option key={p.code} value={p._id || p.code}>
                            {p.name} ({p.availabilityMode === "pre_order" ? "Pre-order Open" : p.availabilityMode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Packaging Variant
                      </label>
                      <select
                        value={selectedOptionLabel}
                        onChange={(e) => handleOptionChange(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                      >
                        {products
                          .find((p) => (p._id || p.code) === selectedProductId)
                          ?.sellingOptions?.map((opt, idx) => (
                            <option key={idx} value={opt.label}>
                              {opt.label} ({opt.qtyG}g) — ৳{opt.sellingPrice}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Quantity (kg)
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        value={orderQtyKg}
                        onChange={(e) => setOrderQtyKg(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Quoted Total (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        value={quotedPrice}
                        onChange={(e) => setQuotedPrice(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-orange-950"
                      />
                    </div>
                  </div>
                </div>

                {/* Deposit Entry */}
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Customer Deposit (Customer Liability)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                        Deposit Amount (৳)
                      </label>
                      <input
                        type="number"
                        value={initialDepositAmount}
                        onChange={(e) => setInitialDepositAmount(e.target.value)}
                        placeholder="0"
                        className="w-full text-xs bg-white border border-blue-300 rounded-lg p-2 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                        Method
                      </label>
                      <select
                        value={initialDepositMethod}
                        onChange={(e) => setInitialDepositMethod(e.target.value)}
                        className="w-full text-xs bg-white border border-blue-300 rounded-lg p-2"
                      >
                        <option value="bkash">bKash</option>
                        <option value="nagad">Nagad</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="cash">Cash Advance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-blue-900 mb-1">
                        Trx ID
                      </label>
                      <input
                        type="text"
                        value={initialDepositTrxId}
                        onChange={(e) => setInitialDepositTrxId(e.target.value)}
                        placeholder="e.g. 9J29KSM1"
                        className="w-full text-xs bg-white border border-blue-300 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Saving..." : "Create Pre-Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pathao Dispatch Review Modal */}
      <PathaoDispatchModal
        isOpen={Boolean(selectedPreOrderForPathao)}
        onClose={() => setSelectedPreOrderForPathao(null)}
        onSuccess={() => {
          loadData();
          setSelectedPreOrderForPathao(null);
        }}
        orderType="preorder"
        order={selectedPreOrderForPathao}
      />
    </div>
  );
}

