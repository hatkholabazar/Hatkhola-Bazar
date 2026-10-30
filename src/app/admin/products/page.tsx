"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaTags,
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaExclamationTriangle,
  FaLeaf,
  FaHistory,
  FaClock,
  FaBoxOpen,
  FaCalendarAlt,
  FaInfoCircle,
  FaCamera,
  FaSpinner,
} from "react-icons/fa";
import AdminHeader from "@/components/admin/AdminHeader";
import { adminApi, IAdminProduct, IAuditLogItem } from "@/lib/admin-api";
import { formatTaka, formatGramsToKg, kgToGrams } from "@/config/admin-labels";
import { uploadToCloudinary } from "@/lib/cloudinary-client";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IAdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IAdminProduct | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [benefitsStr, setBenefitsStr] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [lowStockKg, setLowStockKg] = useState("5");
  const [marginPercent, setMarginPercent] = useState("25");
  const [isSeasonal, setIsSeasonal] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Availability & Pre-order State
  const [availabilityMode, setAvailabilityMode] = useState<
    "in_stock" | "pre_order" | "out_of_stock"
  >("in_stock");
  const [expectedNote, setExpectedNote] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [maxQtyKg, setMaxQtyKg] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [cancellationPolicyText, setCancellationPolicyText] = useState("");

  // Multiple quantity variants / selling options
  const [variants, setVariants] = useState<
    { label: string; qtyKg: string; sellingPrice: string }[]
  >([
    { label: "1 kg Pack", qtyKg: "1", sellingPrice: "1400" },
    { label: "500 g Pack", qtyKg: "0.5", sellingPrice: "750" },
  ]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit.");
      return;
    }

    setIsUploadingImg(true);
    setUploadError(null);
    try {
      const result = await uploadToCloudinary(file, "product", true);
      setImageUrl(result.secureUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image to Cloudinary";
      setUploadError(msg);
    } finally {
      setIsUploadingImg(false);
      e.target.value = "";
    }
  };

  // Audit Logs Modal
  const [selectedAuditProduct, setSelectedAuditProduct] = useState<IAdminProduct | null>(null);
  const [auditLogs, setAuditLogs] = useState<IAuditLogItem[]>([]);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Open modal in Create mode
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormError(null);
    setCode("");
    setName("");
    setSlug("");
    setDescription("");
    setBenefitsStr("");
    setImageUrl("");
    setLowStockKg("5");
    setMarginPercent("25");
    setIsSeasonal(false);
    setIsActive(true);
    setAvailabilityMode("in_stock");
    setExpectedNote("");
    setExpectedDate("");
    setDepositRequired(false);
    setDepositAmount("");
    setDepositPercent("");
    setMaxQtyKg("");
    setClosesAt("");
    setCancellationPolicyText("");
    setVariants([
      { label: "1 kg Pack", qtyKg: "1", sellingPrice: "1400" },
      { label: "500 g Pack", qtyKg: "0.5", sellingPrice: "750" },
    ]);
    setIsModalOpen(true);
  };

  // Open modal in Edit mode
  const handleOpenEditModal = (p: IAdminProduct, overrideMode?: "in_stock" | "pre_order" | "out_of_stock") => {
    setEditingProduct(p);
    setFormError(null);
    setCode(p.code);
    setName(p.name);
    setSlug(p.slug || p.code.toLowerCase());
    setDescription(p.description || "");
    setBenefitsStr((p.benefits || []).join("\n"));
    setImageUrl(p.image || "");
    setLowStockKg(String((p.lowStockThresholdG || 5000) / 1000));
    setMarginPercent(String(p.marginPercent || 25));
    setIsSeasonal(Boolean(p.isSeasonal));
    setIsActive(p.isActive !== undefined ? Boolean(p.isActive) : true);

    const mode = overrideMode || p.availabilityMode || "in_stock";
    setAvailabilityMode(mode);
    setExpectedNote(p.preOrder?.expectedNote || "");
    setExpectedDate(
      p.preOrder?.expectedDate ? new Date(p.preOrder.expectedDate).toISOString().slice(0, 10) : ""
    );
    setDepositRequired(Boolean(p.preOrder?.depositRequired));
    setDepositAmount(p.preOrder?.depositAmount ? String(p.preOrder.depositAmount) : "");
    setDepositPercent(p.preOrder?.depositPercent ? String(p.preOrder.depositPercent) : "");
    setMaxQtyKg(p.preOrder?.maxQtyG ? String(p.preOrder.maxQtyG / 1000) : "");
    setClosesAt(
      p.preOrder?.closesAt ? new Date(p.preOrder.closesAt).toISOString().slice(0, 10) : ""
    );
    setCancellationPolicyText(p.preOrder?.cancellationPolicyText || "");

    if (p.sellingOptions && p.sellingOptions.length > 0) {
      setVariants(
        p.sellingOptions.map((opt) => ({
          label: opt.label,
          qtyKg: String(opt.qtyG / 1000),
          sellingPrice: String(opt.sellingPrice),
        }))
      );
    } else {
      setVariants([{ label: "1 kg Pack", qtyKg: "1", sellingPrice: "1000" }]);
    }

    setIsModalOpen(true);
  };

  // Open Audit Log viewer
  const handleViewAudit = async (p: IAdminProduct) => {
    setSelectedAuditProduct(p);
    setIsAuditModalOpen(true);
    setLoadingAudit(true);
    try {
      const logs = await adminApi.getProductAuditLogs(p._id || p.code);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Error loading audit logs:", err);
      setAuditLogs([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Delete / Archive Product
  const handleDeleteProduct = async (p: IAdminProduct) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete ${p.name} (${p.code})?\n\nIf batches or sales exist for this product, it will be safely archived (inactive) to protect accounting records.`
    );
    if (!isConfirmed) return;

    try {
      const res = await adminApi.deleteProduct(p._id || p.code);
      if (res.archived) {
        alert(res.message);
      }
      await loadProducts();
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    }
  };

  // Add variant row
  const addVariantRow = () => {
    setVariants([
      ...variants,
      { label: "New Variant", qtyKg: "1", sellingPrice: "1000" },
    ]);
  };

  // Remove variant row
  const removeVariantRow = (index: number) => {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Update variant field
  const updateVariant = (
    index: number,
    field: "label" | "qtyKg" | "sellingPrice",
    val: string
  ) => {
    const updated = [...variants];
    updated[index][field] = val;
    setVariants(updated);
  };

  // Handle Form Submit (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!code.trim() || !name.trim()) {
      setFormError("Product Code and Name are required.");
      return;
    }

    if (availabilityMode === "pre_order" && !expectedNote.trim() && !expectedDate) {
      setFormError("Pre-order mode requires either an Expected Note or Expected Delivery Date.");
      return;
    }

    // Warning if switching off pre-order with open pre-orders
    if (
      editingProduct &&
      editingProduct.availabilityMode === "pre_order" &&
      availabilityMode !== "pre_order" &&
      (editingProduct.openPreOrderGrams || 0) > 0
    ) {
      const proceed = window.confirm(
        `Warning: This product currently has ${(editingProduct.openPreOrderGrams || 0) / 1000} kg of open pre-orders.\n\nSwitching availability mode to "${availabilityMode}" will stop new pre-orders on the public storefront, but existing open pre-orders must still be fulfilled or cancelled. Do you want to proceed?`
      );
      if (!proceed) return;
    }

    const sellingOptions = variants.map((v) => ({
      label: v.label.trim(),
      qtyG: kgToGrams(v.qtyKg),
      sellingPrice: Math.round(Number(v.sellingPrice) || 0),
    }));

    if (sellingOptions.some((v) => v.qtyG <= 0 || v.sellingPrice <= 0)) {
      setFormError("Each packaging option must have valid quantity and price.");
      return;
    }

    const benefits = benefitsStr
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);

    const preOrderConfig =
      availabilityMode === "pre_order"
        ? {
            expectedNote: expectedNote.trim() || undefined,
            expectedDate: expectedDate ? expectedDate : undefined,
            depositRequired,
            depositAmount: depositAmount ? Math.round(Number(depositAmount)) : undefined,
            depositPercent: depositPercent ? Math.round(Number(depositPercent)) : undefined,
            maxQtyG: maxQtyKg ? kgToGrams(maxQtyKg) : undefined,
            closesAt: closesAt ? closesAt : undefined,
            cancellationPolicyText: cancellationPolicyText.trim() || undefined,
          }
        : undefined;

    const payload: Partial<IAdminProduct> = {
      code: code.trim().toUpperCase(),
      slug: slug.trim() || code.trim().toLowerCase(),
      name: name.trim(),
      baseUnit: "g",
      description: description.trim() || undefined,
      benefits: benefits.length > 0 ? benefits : undefined,
      image: imageUrl.trim() || undefined,
      sellingOptions,
      lowStockThresholdG: kgToGrams(lowStockKg),
      marginPercent: Math.round(Number(marginPercent) || 25),
      isSeasonal,
      isActive,
      availabilityMode,
      preOrder: preOrderConfig,
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct._id || editingProduct.code, payload);
      } else {
        await adminApi.upsertProduct(payload);
      }

      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Products & Expansion Catalog"
        subtitle="Manage product availability (In Stock, Pre-Order, Out of Stock), packaging options, and audit logs"
        actions={
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors"
          >
            <FaPlus className="text-xs" />
            <span>Add New Product</span>
          </button>
        }
      />

      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products by code, name, or slug..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
            />
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const mode = p.availabilityMode || "in_stock";
            const stockKg = ((p.stockGrams || 0) / 1000).toFixed(1);
            const openDemandKg = ((p.openPreOrderGrams || 0) / 1000).toFixed(1);

            return (
              <div
                key={p.code}
                className={`bg-white rounded-2xl border shadow-xs overflow-hidden flex flex-col justify-between transition-all ${
                  p.isActive
                    ? "border-slate-200 hover:border-slate-300"
                    : "border-slate-200 bg-slate-50/50 opacity-75"
                }`}
              >
                <div className="p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800">
                          {p.code}
                        </span>
                        {p.isSeasonal && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <FaLeaf className="text-[8px]" /> Seasonal
                          </span>
                        )}
                        {/* Availability Mode Badge */}
                        {mode === "pre_order" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white shadow-xs">
                            <FaClock className="text-[8px]" /> Pre-order Active
                          </span>
                        ) : mode === "out_of_stock" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            <FaBoxOpen className="text-[8px]" /> Out of Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <FaCheckCircle className="text-[8px]" /> In Stock
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {p.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        /{p.slug}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewAudit(p)}
                      title="View Mode Change Audit Logs"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <FaHistory className="text-xs" />
                    </button>
                  </div>

                  {/* Stock 0 Suggestion Hint */}
                  {p.stockSuggestion && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-900 font-medium">
                        <FaInfoCircle className="text-amber-600 shrink-0 text-xs" />
                        <span>Available stock is 0 kg.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p, "pre_order")}
                        className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-2xs whitespace-nowrap transition-colors cursor-pointer"
                      >
                        Switch to Pre-order
                      </button>
                    </div>
                  )}

                  {/* Pre-order Details Banner if mode === 'pre_order' */}
                  {mode === "pre_order" && p.preOrder && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-1 text-xs">
                      <div className="font-bold text-amber-950 flex items-center gap-1.5">
                        <FaCalendarAlt className="text-amber-600 text-[10px]" />
                        <span>{p.preOrder.expectedNote || "Pre-order Open"}</span>
                      </div>
                      {p.preOrder.expectedDate && (
                        <p className="text-[11px] text-amber-800">
                          Target Delivery: {new Date(p.preOrder.expectedDate).toLocaleDateString()}
                        </p>
                      )}
                      {p.preOrder.depositRequired && (
                        <p className="text-[11px] text-amber-800 font-medium">
                          Deposit: {p.preOrder.depositAmount ? formatTaka(p.preOrder.depositAmount) : `${p.preOrder.depositPercent}%`} required
                        </p>
                      )}
                      {(p.openPreOrderGrams || 0) > 0 && (
                        <div className="pt-1 mt-1 border-t border-amber-200/60 font-bold text-amber-900 text-[11px] flex justify-between">
                          <span>Open Demand:</span>
                          <span>{openDemandKg} kg</span>
                        </div>
                      )}
                    </div>
                  )}

                  {p.description && (
                    <p className="text-xs text-slate-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Selling Options / Variants */}
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Packaging Options & Prices ({p.sellingOptions.length})
                    </h4>
                    <div className="space-y-1">
                      {p.sellingOptions.map((opt, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                        >
                          <span className="font-medium text-slate-700">
                            {opt.label} ({opt.qtyG}g)
                          </span>
                          <span className="font-bold text-slate-900">
                            {formatTaka(opt.sellingPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer with Details & Actions */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">
                      Physical Stock: <b className="text-slate-700">{stockKg} kg</b>
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      {p.marginPercent}% target margin
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      title="Edit Product Details & Pre-order Mode"
                    >
                      <FaEdit className="text-[10px] text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p)}
                      className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      title="Delete or Archive Product"
                    >
                      <FaTrash className="text-[10px]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Modal (Create & Edit Full Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct
                    ? `Edit Product: ${editingProduct.name} (${editingProduct.code})`
                    : "Introduce New Artisanal Product"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure availability mode, pre-order deposit settings, variants and stock alerts
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 space-y-4">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <FaExclamationTriangle className="text-rose-500 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Availability Mode Selector */}
                <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Store Availability Mode *
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Choose whether customers can buy immediately or pre-order
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                      <button
                        type="button"
                        onClick={() => setAvailabilityMode("in_stock")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          availabilityMode === "in_stock"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        In Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailabilityMode("pre_order")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          availabilityMode === "pre_order"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Pre-Order
                      </button>
                      <button
                        type="button"
                        onClick={() => setAvailabilityMode("out_of_stock")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          availabilityMode === "out_of_stock"
                            ? "bg-slate-700 text-white shadow-xs"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        Out of Stock
                      </button>
                    </div>
                  </div>

                  {/* Inline Pre-order Panel (Revealed when pre_order mode selected) */}
                  {availabilityMode === "pre_order" && (
                    <div className="pt-3 border-t border-orange-200/60 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Expected Availability Note * (e.g. &quot;Mid-December Winter Harvest&quot;)
                          </label>
                          <input
                            type="text"
                            required
                            value={expectedNote}
                            onChange={(e) => setExpectedNote(e.target.value)}
                            placeholder="e.g. Expected mid-December 2026"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Target Delivery Date (Optional)
                          </label>
                          <input
                            type="date"
                            value={expectedDate}
                            onChange={(e) => setExpectedDate(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={depositRequired}
                              onChange={(e) => setDepositRequired(e.target.checked)}
                              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                            />
                            <span>Require Deposit</span>
                          </label>
                          {depositRequired && (
                            <div>
                              <label className="block text-[10px] text-slate-500 mb-0.5">
                                Flat Deposit (৳)
                              </label>
                              <input
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="e.g. 500"
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded p-1.5 font-bold"
                              />
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Pre-Order Cap (kg) (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            value={maxQtyKg}
                            onChange={(e) => setMaxQtyKg(e.target.value)}
                            placeholder="e.g. 50 (max 50 kg)"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Closes At (Cutoff Date)
                          </label>
                          <input
                            type="date"
                            value={closesAt}
                            onChange={(e) => setClosesAt(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Cancellation & Refund Policy Note
                        </label>
                        <input
                          type="text"
                          value={cancellationPolicyText}
                          onChange={(e) => setCancellationPolicyText(e.target.value)}
                          placeholder="e.g. 100% full refund if cancelled 48h prior to shipment"
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Identifiers, Descriptions & Benefits */}
                  <div className="space-y-3.5">
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Product Identity
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Product Code *
                          </label>
                          <input
                            type="text"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="e.g. MUSTARD"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold uppercase"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Product Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Pure Mustard Oil"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Slug (URL Identifier)
                          </label>
                          <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            placeholder="e.g. mustard-oil"
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono text-slate-700"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Image URL / Cloudinary Photo
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="e.g. /hatkhola-logo.png or upload photo"
                              className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-700 font-mono"
                            />
                            <label
                              className={`shrink-0 px-3 py-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition ${
                                isUploadingImg ? "opacity-60 pointer-events-none" : ""
                              }`}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                disabled={isUploadingImg}
                                onChange={handleProductImageUpload}
                                className="hidden"
                              />
                              {isUploadingImg ? (
                                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FaCamera className="w-3.5 h-3.5" />
                              )}
                              <span>{isUploadingImg ? "Uploading..." : "Upload"}</span>
                            </label>
                          </div>
                          {uploadError && (
                            <p className="text-[10px] text-rose-600 mt-1 font-semibold">
                              {uploadError}
                            </p>
                          )}
                          {imageUrl && (
                            <div className="mt-2 flex items-center gap-2 p-1.5 bg-orange-50/50 rounded-lg border border-orange-100">
                              <img
                                src={imageUrl}
                                alt="Product preview"
                                className="w-8 h-8 object-cover rounded border border-slate-200"
                              />
                              <span className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                                {imageUrl}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Product Description
                        </label>
                        <textarea
                          rows={2}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Cold-pressed traditional village oil..."
                          className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2">
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Product Benefits (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={benefitsStr}
                        onChange={(e) => setBenefitsStr(e.target.value)}
                        placeholder="100% cold pressed without chemicals&#10;Rich in natural antioxidants"
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>

                  {/* Right Column: Packaging Variants & Margins */}
                  <div className="space-y-3.5">
                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Packaging Variants & Prices
                        </h4>
                        <button
                          type="button"
                          onClick={addVariantRow}
                          className="text-xs text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FaPlus className="text-[10px]" /> Add Variant
                        </button>
                      </div>

                      {/* Column Header Titles */}
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-0.5">
                        <div className="col-span-5">Variant Label</div>
                        <div className="col-span-3">Weight (kg)</div>
                        <div className="col-span-3">Price (৳)</div>
                        <div className="col-span-1 text-center"></div>
                      </div>

                      {/* Variant Input Rows */}
                      <div className="space-y-2">
                        {variants.map((v, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                            <input
                              type="text"
                              value={v.label}
                              onChange={(e) => updateVariant(idx, "label", e.target.value)}
                              placeholder="e.g. 1 kg Jar"
                              className="col-span-5 w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <input
                              type="number"
                              step="0.05"
                              value={v.qtyKg}
                              onChange={(e) => updateVariant(idx, "qtyKg", e.target.value)}
                              placeholder="kg"
                              className="col-span-3 w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <input
                              type="number"
                              value={v.sellingPrice}
                              onChange={(e) => updateVariant(idx, "sellingPrice", e.target.value)}
                              placeholder="৳"
                              className="col-span-3 w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-orange-950 focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <div className="col-span-1 flex justify-center">
                              {variants.length > 1 ? (
                                <button
                                  type="button"
                                  onClick={() => removeVariantRow(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors cursor-pointer"
                                  title="Delete variant"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              ) : (
                                <span className="w-4" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Inventory Controls & Status
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Low Stock Alert (kg)
                          </label>
                          <input
                            type="number"
                            value={lowStockKg}
                            onChange={(e) => setLowStockKg(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Target Margin (%)
                          </label>
                          <input
                            type="number"
                            value={marginPercent}
                            onChange={(e) => setMarginPercent(e.target.value)}
                            className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSeasonal}
                            onChange={(e) => setIsSeasonal(e.target.checked)}
                            className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span>Seasonal Harvest Product</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>Active in Store</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/90 shrink-0 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {isAuditModalOpen && selectedAuditProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FaHistory className="text-orange-600" />
                  <span>Audit Trail: {selectedAuditProduct.name}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Immutable record of availability mode changes, dates, and actors
                </p>
              </div>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {loadingAudit ? (
                <p className="text-xs text-slate-500 text-center py-6">Loading audit records...</p>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No mode change events logged yet for this product.
                </div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log._id}
                    className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold text-[10px]">
                        From: {log.fromState || "N/A"}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold text-[10px]">
                        To: {log.toState}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Changed by: <b>{log.actor}</b></span>
                      {log.metadata?.openPreOrderGrams > 0 && (
                        <span className="text-amber-700 font-semibold">
                          Open demand at change: {log.metadata.openPreOrderGrams / 1000} kg
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
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
