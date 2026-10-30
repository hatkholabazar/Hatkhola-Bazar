"use client";

import { useState, useEffect, useMemo } from "react";
import {
  FaBoxes,
  FaPlus,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimes,
  FaTrash,
  FaEye,
  FaBalanceScale,
  FaFileInvoice,
  FaBan,
  FaWhatsapp,
  FaCloudUploadAlt,
  FaInfoCircle,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import AttachmentUploader from "@/components/admin/AttachmentUploader";
import {
  adminApi,
  IAdminProduct,
  IStockBatch,
  IAttachmentMeta,
  IPreOrderMetrics,
} from "@/lib/admin-api";
import {
  ADMIN_LABELS,
  formatTaka,
  formatGramsToKg,
  kgToGrams,
  formatAdminDate,
} from "@/config/admin-labels";

export default function AdminStockPage() {
  const [batches, setBatches] = useState<IStockBatch[]>([]);
  const [products, setProducts] = useState<IAdminProduct[]>([]);
  const [preOrderMetrics, setPreOrderMetrics] = useState<IPreOrderMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");

  // Modals
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false);
  const [isPhysicalCountOpen, setIsPhysicalCountOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [selectedBatchDetail, setSelectedBatchDetail] = useState<{
    batch: IStockBatch;
    allocationsHistory: any[];
  } | null>(null);

  // Add Batch Form State
  const [selectedProductCode, setSelectedProductCode] = useState("GHEE");
  const [purchasedDate, setPurchasedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [supplierName, setSupplierName] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [orderedKg, setOrderedKg] = useState<string>("10");
  const [receivedKg, setReceivedKg] = useState<string>("10");
  const [productCost, setProductCost] = useState<string>("9500");
  const [courierCharge, setCourierCharge] = useState<string>("250");
  const [codFee, setCodFee] = useState<string>("50");
  const [otherExtraCost, setOtherExtraCost] = useState<string>("0");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [referenceType, setReferenceType] = useState("courier_tracking");
  const [referenceValue, setReferenceValue] = useState("");
  const [courierName, setCourierName] = useState("Pathao");
  const [batchNote, setBatchNote] = useState("");
  const [attachments, setAttachments] = useState<IAttachmentMeta[]>([]);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    message: string;
    existingBatchNo: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Physical Count State
  const [physicalCountProductCode, setPhysicalCountProductCode] = useState("GHEE");
  const [actualWeighedKg, setActualWeighedKg] = useState<string>("");
  const [physicalCountReason, setPhysicalCountReason] = useState(
    "Routine physical scale inventory check"
  );

  // Adjustment State
  const [adjProductCode, setAdjProductCode] = useState("GHEE");
  const [adjType, setAdjType] = useState<"wastage" | "sample" | "correction">("wastage");
  const [adjKg, setAdjKg] = useState<string>("0.25");
  const [adjReason, setAdjReason] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedBatches, fetchedProducts, fetchedMetrics] = await Promise.all([
        adminApi.getBatches(),
        adminApi.getProducts(),
        adminApi.getPreOrderMetrics().catch(() => null),
      ]);
      setBatches(fetchedBatches);
      setProducts(fetchedProducts);
      setPreOrderMetrics(fetchedMetrics);
      if (fetchedProducts.length > 0 && !selectedProductCode) {
        setSelectedProductCode(fetchedProducts[0].code);
      }
    } catch (err) {
      console.error("Error loading stock data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateToPreOrders = async (productId: string, batchId: string) => {
    try {
      const res = await adminApi.autoAllocateBatchToOpenPreOrders(productId, batchId);
      alert(res.message);
      await loadData();
    } catch (err: any) {
      alert(err.message || "Failed to allocate batch to pre-orders");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Live calculations for Add Batch modal
  const orderedG = kgToGrams(orderedKg);
  const receivedG = kgToGrams(receivedKg);
  const shortageG = orderedG > receivedG ? orderedG - receivedG : 0;
  const shortagePercent = orderedG > 0 ? ((shortageG / orderedG) * 100).toFixed(1) : "0.0";
  const isShortageCritical = parseFloat(shortagePercent) > 2.0;

  const numProdCost = Math.round(Number(productCost) || 0);
  const numCourier = Math.round(Number(courierCharge) || 0);
  const numCod = Math.round(Number(codFee) || 0);
  const numOther = Math.round(Number(otherExtraCost) || 0);
  const totalExtraCost = numCourier + numCod + numOther;
  const totalLandedCost = numProdCost + totalExtraCost;
  const costPerKg = receivedG > 0 ? Math.round((totalLandedCost / receivedG) * 1000) : 0;

  // Handle Add Batch Submission
  const handleCreateBatch = async (forceDuplicate = false) => {
    setFormError(null);
    if (!supplierName.trim()) {
      setFormError("Supplier name is required.");
      return;
    }
    if (!supplierPhone.trim()) {
      setFormError("Supplier phone number is required.");
      return;
    }
    if (receivedG <= 0) {
      setFormError("Received quantity must be greater than zero.");
      return;
    }
    if (totalLandedCost <= 0) {
      setFormError("Total landed cost must be greater than zero.");
      return;
    }

    setIsSubmitting(true);
    try {
      await adminApi.createBatch({
        productCode: selectedProductCode,
        purchasedAt: new Date(purchasedDate),
        receivedAt: new Date(receivedDate),
        supplierName: supplierName.trim(),
        supplierPhone: supplierPhone.trim(),
        orderedQtyG: orderedG,
        receivedQtyG: receivedG,
        productCost: numProdCost,
        courierCharge: numCourier,
        codFee: numCod,
        otherExtraCost: numOther,
        paymentMethod,
        referenceType,
        referenceValue: referenceValue.trim() || undefined,
        courierName: referenceType === "courier_tracking" ? courierName : undefined,
        attachments,
        note: batchNote.trim() || undefined,
        allowDuplicateReference: forceDuplicate,
      });

      setIsAddBatchOpen(false);
      setDuplicateWarning(null);
      // Reset form
      setSupplierName("");
      setSupplierPhone("");
      setReferenceValue("");
      setAttachments([]);
      setBatchNote("");
      await loadData();
    } catch (err: any) {
      if (err.requiresConfirmation) {
        setDuplicateWarning({
          message: err.message,
          existingBatchNo: err.existingBatchNo,
        });
      } else {
        setFormError(err.message || "Failed to create batch.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Void a batch
  const handleVoidBatch = async (batchId: string) => {
    const reason = window.prompt("Enter explicit reason for voiding this unused batch:");
    if (!reason || !reason.trim()) return;

    try {
      await adminApi.voidBatch(batchId, reason.trim());
      if (selectedBatchDetail) {
        setSelectedBatchDetail(null);
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || "Could not void batch.");
    }
  };

  // Handle Physical Inventory Count Reconcile
  const handleReconcilePhysicalCount = async () => {
    const actualG = kgToGrams(actualWeighedKg);
    if (actualG <= 0) {
      alert("Please enter a valid weighed quantity.");
      return;
    }

    try {
      await adminApi.reconcilePhysicalCount({
        productId: physicalCountProductCode,
        actualQtyG: actualG,
        reason: physicalCountReason,
      });
      setIsPhysicalCountOpen(false);
      setActualWeighedKg("");
      await loadData();
    } catch (err: any) {
      alert(err.message || "Physical count reconciliation failed.");
    }
  };

  // Filtered Batches List
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      const prodCode = typeof b.product === "object" ? b.product.code : b.product;
      if (productFilter !== "all" && prodCode !== productFilter) return false;

      if (searchTerm.trim()) {
        const s = searchTerm.toLowerCase();
        const bNo = b.batchNo.toLowerCase();
        const sName = (b.supplierName || "").toLowerCase();
        const sPhone = (b.supplierPhone || "").toLowerCase();
        const refVal = (b.referenceValue || "").toLowerCase();
        return (
          bNo.includes(s) ||
          sName.includes(s) ||
          sPhone.includes(s) ||
          refVal.includes(s)
        );
      }
      return true;
    });
  }, [batches, statusFilter, productFilter, searchTerm]);

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Inventory & Artisanal Batches"
        subtitle="Server-generated atomic batches, received weight costing & proof archive"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPhysicalCountOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <FaBalanceScale className="text-xs text-blue-600" />
              <span>Physical Count</span>
            </button>
            <button
              onClick={() => setIsAddBatchOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
            >
              <FaPlus className="text-xs" />
              <span>Add Harvest Batch</span>
            </button>
          </div>
        }
      />

      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Reserved vs Free Stock Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Physical Stock
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {(
                batches
                  .filter((b) => b.status === "active")
                  .reduce((acc, b) => acc + b.qtyRemainingG, 0) / 1000
              ).toFixed(1)}{" "}
              kg
            </div>
            <span className="text-[10px] text-slate-400">Total remaining across active batches</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
              Pre-Order Reserved Demand
            </span>
            <div className="text-xl font-extrabold text-amber-600 mt-1">
              {((preOrderMetrics?.openGrams || 0) / 1000).toFixed(1)} kg
            </div>
            <span className="text-[10px] text-amber-700">Committed to advance customer orders</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
              Free Available Stock
            </span>
            <div className="text-xl font-extrabold text-emerald-700 mt-1">
              {(
                Math.max(
                  0,
                  batches
                    .filter((b) => b.status === "active")
                    .reduce((acc, b) => acc + b.qtyRemainingG, 0) -
                    (preOrderMetrics?.openGrams || 0)
                ) / 1000
              ).toFixed(1)}{" "}
              kg
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Safe to sell (no double selling)</span>
          </div>
        </div>

        {/* Pre-order Demand Alert Banners */}
        {preOrderMetrics?.productDemands &&
          preOrderMetrics.productDemands
            .filter((d) => d.openGrams > 0)
            .map((dem) => {
              const matchingBatch = batches.find(
                (b) =>
                  b.status === "active" &&
                  (typeof b.product === "object"
                    ? (b.product as any)._id === dem.productId || (b.product as any).code === dem.productCode
                    : b.product === dem.productId)
              );

              return (
                <div
                  key={dem.productId}
                  className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold text-[10px] uppercase">
                        Advance Demand
                      </span>
                      <h4 className="font-bold text-sm text-amber-950">
                        {dem.productName} ({dem.productCode})
                      </h4>
                    </div>
                    <p className="text-xs text-amber-800">
                      Open pre-orders need <b>{(dem.openGrams / 1000).toFixed(1)} kg</b>.
                      Physical stock in batches: <b>{(dem.availableStockGrams / 1000).toFixed(1)} kg</b>.
                    </p>
                  </div>

                  {matchingBatch && (
                    <button
                      onClick={() => handleAllocateToPreOrders(dem.productId, matchingBatch._id)}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Allocate Batch {matchingBatch.batchNo} to Pre-orders
                    </button>
                  )}
                </div>
              );
            })}

        {/* Search & Filter Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Batch #, Supplier, Ref ID..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="depleted">Depleted</option>
              <option value="voided">Voided</option>
            </select>

            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Batches Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[calc(100vh-280px)] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold sticky top-0 z-10 shadow-2xs">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Batch Number</th>
                  <th className="py-3 px-4 whitespace-nowrap">Product</th>
                  <th className="py-3 px-4 whitespace-nowrap">Supplier & Reference</th>
                  <th className="py-3 px-4 whitespace-nowrap">Received / Ordered</th>
                  <th className="py-3 px-4 whitespace-nowrap">Unit Cost (Landed)</th>
                  <th className="py-3 px-4 whitespace-nowrap">Stock Left</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredBatches.length > 0 ? (
                  filteredBatches.map((b) => {
                    const prodName =
                      typeof b.product === "object"
                        ? b.product.name
                        : b.product;
                    const percentRemaining =
                      b.receivedQtyG > 0
                        ? Math.round((b.qtyRemainingG / b.receivedQtyG) * 100)
                        : 0;

                    return (
                      <tr
                        key={b._id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          b.status === "voided" ? "opacity-60 bg-rose-50/20" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {b.batchNo}
                        </td>
                        <td className="py-3 px-4">{prodName}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800">
                            {b.supplierName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            {b.supplierPhone && (
                              <a
                                href={`https://wa.me/88${b.supplierPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-0.5"
                                title="Open WhatsApp"
                              >
                                <FaWhatsapp className="text-[10px]" />
                                {b.supplierPhone}
                              </a>
                            )}
                            {b.referenceValue && (
                              <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">
                                {b.referenceValue}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">
                            {formatGramsToKg(b.receivedQtyG)}
                          </p>
                          {b.orderedQtyG !== b.receivedQtyG && (
                            <p className="text-[10px] text-amber-600 font-semibold">
                              Ordered: {formatGramsToKg(b.orderedQtyG)}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">
                            {formatTaka(b.unitCostPerKg || Math.round((b.totalCost / b.receivedQtyG) * 1000))}/kg
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Total: {formatTaka(b.totalCost)}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <p className="font-bold text-slate-900">
                              {formatGramsToKg(b.qtyRemainingG)}{" "}
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({percentRemaining}%)
                              </span>
                            </p>
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  percentRemaining < 20
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${percentRemaining}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {b.status === "active" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <FaCheckCircle className="text-[8px]" /> Active
                            </span>
                          )}
                          {b.status === "depleted" && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              Depleted
                            </span>
                          )}
                          {b.status === "voided" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <FaBan className="text-[8px]" /> Voided
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={async () => {
                              try {
                                const detail = await adminApi.getBatchDetail(b._id);
                                setSelectedBatchDetail(detail);
                              } catch {
                                setSelectedBatchDetail({
                                  batch: b,
                                  allocationsHistory: [],
                                });
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            <FaEye className="text-[10px]" /> Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No stock batches found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: Add New Batch (Wide 2-Column Desktop Layout) */}
      {isAddBatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Receive Artisanal Stock Batch
                </h3>
                <p className="text-xs text-slate-500">
                  Generates an immutable atomic batch number with exact received-weight costing
                </p>
              </div>
              <button
                onClick={() => setIsAddBatchOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Scrollable Body - 2 Columns */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <FaExclamationTriangle className="text-rose-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Duplicate Reference Warning Dialog */}
              {duplicateWarning && (
                <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-800">
                    <FaExclamationTriangle className="text-base" />
                    <span>Duplicate Reference Warning</span>
                  </div>
                  <p>{duplicateWarning.message}</p>
                  <p className="font-mono font-bold">
                    Matches existing Batch: {duplicateWarning.existingBatchNo}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleCreateBatch(true)}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                    >
                      Confirm & Save Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateWarning(null)}
                      className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Top Row: Product & Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Product *
                  </label>
                  <select
                    value={selectedProductCode}
                    onChange={(e) => setSelectedProductCode(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium focus:ring-1 focus:ring-orange-500"
                  >
                    {products.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Purchased At
                  </label>
                  <input
                    type="date"
                    value={purchasedDate}
                    onChange={(e) => setPurchasedDate(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Received At
                  </label>
                  <input
                    type="date"
                    value={receivedDate}
                    onChange={(e) => setReceivedDate(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                  />
                </div>
              </div>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column: Supplier & Reference */}
                <div className="space-y-3.5">
                  {/* Supplier Details */}
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Supplier Details</span>
                      <span className="text-[10px] text-slate-400 font-normal lowercase">(village maker)</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Supplier Name *
                        </label>
                        <input
                          type="text"
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                          placeholder="e.g. Kashem Ali / Pabna"
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          WhatsApp Phone *
                        </label>
                        <input
                          type="text"
                          value={supplierPhone}
                          onChange={(e) => setSupplierPhone(e.target.value)}
                          placeholder="e.g. 01711223344"
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment & Logistics Reference */}
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Logistics & Tracking Reference
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
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
                          Reference Type
                        </label>
                        <select
                          value={referenceType}
                          onChange={(e) => setReferenceType(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        >
                          {ADMIN_LABELS.referenceTypes.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Ref ID / Tracking Consignment
                        </label>
                        <input
                          type="text"
                          value={referenceValue}
                          onChange={(e) => setReferenceValue(e.target.value)}
                          placeholder="e.g. STFD-89412"
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Courier Name
                        </label>
                        <select
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2"
                        >
                          {ADMIN_LABELS.couriers.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!referenceValue.trim() && attachments.length === 0 && (
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-700 flex items-center gap-1.5">
                        <FaInfoCircle className="text-blue-500 shrink-0 text-xs" />
                        <span>No reference saved yet. Consider attaching WhatsApp deal chat or courier slip.</span>
                      </div>
                    )}
                  </div>

                  {/* Batch Note */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Internal Harvest Note (Optional)
                    </label>
                    <input
                      type="text"
                      value={batchNote}
                      onChange={(e) => setBatchNote(e.target.value)}
                      placeholder="e.g. Winter first batch from Jessore / Pabna pure cow butter"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                    />
                  </div>
                </div>

                {/* Right Column: Weight, Landed Costing & Attachments */}
                <div className="space-y-3.5">
                  {/* Weights & Shortage Calculator */}
                  <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                        Weight Verification
                      </h4>
                      {shortageG > 0 && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isShortageCritical
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          Shortage: {formatGramsToKg(shortageG)} ({shortagePercent}%)
                          {isShortageCritical && " (Critical >2%)"}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Ordered (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={orderedKg}
                          onChange={(e) => setOrderedKg(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Received Weighed (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          value={receivedKg}
                          onChange={(e) => setReceivedKg(e.target.value)}
                          className="w-full text-xs bg-white border border-orange-300 rounded-lg p-2 font-mono font-bold text-orange-950 focus:ring-1 focus:ring-orange-500"
                        />
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Stored as {receivedG} g
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Landed Cost Breakdown */}
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Landed Costing (Integer Taka)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                          Product (৳) *
                        </label>
                        <input
                          type="number"
                          value={productCost}
                          onChange={(e) => setProductCost(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                          Courier (৳)
                        </label>
                        <input
                          type="number"
                          value={courierCharge}
                          onChange={(e) => setCourierCharge(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                          COD Fee (৳)
                        </label>
                        <input
                          type="number"
                          value={codFee}
                          onChange={(e) => setCodFee(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600 mb-1 truncate">
                          Other (৳)
                        </label>
                        <input
                          type="number"
                          value={otherExtraCost}
                          onChange={(e) => setOtherExtraCost(e.target.value)}
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5 font-mono"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-500">Landed: </span>
                        <span className="font-extrabold text-slate-900">
                          {formatTaka(totalLandedCost)}
                        </span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                        Unit: {formatTaka(costPerKg)} / kg
                      </div>
                    </div>
                  </div>

                  {/* Cloudinary Attachments */}
                  <div className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-2">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Proof Attachments (Cloudinary Direct)
                    </label>
                    <AttachmentUploader
                      attachments={attachments}
                      onChange={setAttachments}
                      maxFiles={5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-between">
              <div className="hidden sm:flex items-center gap-3 text-xs">
                <span className="text-slate-500">
                  Total Landed: <strong className="text-slate-900">{formatTaka(totalLandedCost)}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500">
                  Unit Cost: <strong className="text-emerald-700">{formatTaka(costPerKg)}/kg</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsAddBatchOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleCreateBatch(false)}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Generating Batch..." : "Receive Batch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Physical Count Reconcile */}
      {isPhysicalCountOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Physical Inventory Scale Audit
              </h3>
              <button
                onClick={() => setIsPhysicalCountOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Weigh the artisanal stock physically. The system will calculate the difference and adjust the oldest active batch automatically.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product
                </label>
                <select
                  value={physicalCountProductCode}
                  onChange={(e) => setPhysicalCountProductCode(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Physically Weighed (kg) *
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={actualWeighedKg}
                  onChange={(e) => setActualWeighedKg(e.target.value)}
                  placeholder="e.g. 14.5"
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Audit Notes / Scale Reference
                </label>
                <input
                  type="text"
                  value={physicalCountReason}
                  onChange={(e) => setPhysicalCountReason(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsPhysicalCountOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleReconcilePhysicalCount}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                Reconcile Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Batch Detail & Allocations Drawer */}
      {selectedBatchDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-mono font-bold text-slate-900">
                  {selectedBatchDetail.batch.batchNo}
                </h3>
                <p className="text-xs text-slate-500">
                  Purchased on {formatAdminDate(selectedBatchDetail.batch.purchasedAt)} • Supplier: {selectedBatchDetail.batch.supplierName}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatchDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <FaTimes />
              </button>
            </div>

            {/* Financial Ledger Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px]">Received</span>
                <p className="font-bold text-slate-900">
                  {formatGramsToKg(selectedBatchDetail.batch.receivedQtyG)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Remaining</span>
                <p className="font-bold text-slate-900">
                  {formatGramsToKg(selectedBatchDetail.batch.qtyRemainingG)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Total Landed</span>
                <p className="font-bold text-slate-900">
                  {formatTaka(selectedBatchDetail.batch.totalCost)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Cost Remaining</span>
                <p className="font-bold text-emerald-600">
                  {formatTaka(selectedBatchDetail.batch.costRemaining)}
                </p>
              </div>
            </div>

            {/* Allocations History */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Sales Allocation History (FIFO Drawn)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                {selectedBatchDetail.allocationsHistory &&
                selectedBatchDetail.allocationsHistory.length > 0 ? (
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Customer</th>
                        <th className="py-2 px-3">Option</th>
                        <th className="py-2 px-3">Qty Drawn</th>
                        <th className="py-2 px-3 text-right">COGS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedBatchDetail.allocationsHistory.map((al, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono">{formatAdminDate(al.soldAt)}</td>
                          <td className="py-2 px-3 font-semibold">{al.customer}</td>
                          <td className="py-2 px-3 text-slate-500">{al.optionLabel}</td>
                          <td className="py-2 px-3 font-bold">{formatGramsToKg(al.qtyG)}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            {formatTaka(al.cost)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No sales have drawn from this batch yet.
                  </div>
                )}
              </div>
            </div>

            {/* Attachments Section */}
            {selectedBatchDetail.batch.attachments &&
              selectedBatchDetail.batch.attachments.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Attached Invoices & Proof
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedBatchDetail.batch.attachments.map((att) => (
                      <div
                        key={att.publicId}
                        className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs bg-white"
                      >
                        <div className="truncate pr-2">
                          <span className="font-bold text-slate-800 block truncate">
                            {att.caption || att.kind}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(att.bytes / 1024).toFixed(0)} KB • {att.format}
                          </span>
                        </div>
                        {att.url && (
                          <a
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 rounded bg-orange-50 text-orange-700 font-bold text-[10px] hover:bg-orange-100"
                          >
                            View
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Void Batch Button (Only if unsold) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              {selectedBatchDetail.batch.status === "active" &&
              selectedBatchDetail.batch.qtyRemainingG ===
                selectedBatchDetail.batch.receivedQtyG ? (
                <button
                  type="button"
                  onClick={() => handleVoidBatch(selectedBatchDetail.batch._id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200"
                >
                  Void Unsold Batch
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 italic">
                  {selectedBatchDetail.batch.status === "voided"
                    ? `Voided: ${selectedBatchDetail.batch.voidReason}`
                    : "Batch has sales allocations — cannot be voided directly."}
                </span>
              )}

              <button
                type="button"
                onClick={() => setSelectedBatchDetail(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900"
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

