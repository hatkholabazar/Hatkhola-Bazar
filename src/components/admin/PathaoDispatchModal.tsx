"use client";

import React, { useState, useEffect } from "react";
import {
  FaTruck,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaCalculator,
  FaStore,
  FaWeightHanging,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa";
import {
  adminApi,
  IPathaoStore,
  IShipment,
} from "@/lib/admin-api";
import PathaoLocationPicker, { PathaoLocationValue } from "./PathaoLocationPicker";

interface PathaoDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (shipment: IShipment) => void;
  orderType: "sale" | "preorder";
  order: any;
}

export default function PathaoDispatchModal({
  isOpen,
  onClose,
  onSuccess,
  orderType,
  order,
}: PathaoDispatchModalProps) {
  // Recipient fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientSecondaryPhone, setRecipientSecondaryPhone] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");

  // Location State via reusable picker
  const [stores, setStores] = useState<IPathaoStore[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>();
  const [locationValue, setLocationValue] = useState<PathaoLocationValue>({ isValid: false });

  // Delivery options
  const [deliveryType, setDeliveryType] = useState<48 | 12>(48);
  const [specialInstruction, setSpecialInstruction] = useState("");
  const [weightOverride, setWeightOverride] = useState<string>("");

  // States
  const [estimatedFee, setEstimatedFee] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStores, setLoadingStores] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute total grams & standard weight
  const totalGrams =
    (order?.items || []).reduce((sum: number, it: any) => sum + (it.qtyG || 0), 0) +
    (order?.giveawayG || 0);

  const calculatedWeightKg = Math.min(
    10.0,
    Math.max(0.5, Math.ceil(((totalGrams + 200) / 1000) * 2) / 2)
  );

  // Compute amount to collect for review display
  let computedAmountToCollect = 0;
  let isPaidUpfront = false;

  if (orderType === "sale") {
    if (order?.paymentMethod && order.paymentMethod !== "cash_on_delivery") {
      isPaidUpfront = true;
      computedAmountToCollect = 0;
    } else {
      computedAmountToCollect = (order?.totalRevenue || 0) + (order?.courierCharge || 0);
    }
  } else {
    computedAmountToCollect = Math.max(
      0,
      (order?.quotedTotal || 0) - (order?.depositTotal || 0)
    );
    if (computedAmountToCollect === 0) {
      isPaidUpfront = true;
    }
  }

  // Prepopulate form on open
  useEffect(() => {
    if (isOpen && order) {
      setRecipientName(order.recipientName || order.customerName || "");
      setRecipientPhone(order.recipientPhone || order.customerPhone || "");
      setRecipientSecondaryPhone("");
      setRecipientAddress(order.recipientAddress || order.customerAddress || order.address || "");
      setWeightOverride("");
      setSpecialInstruction("");
      setEstimatedFee(null);
      setErrorMessage(null);

      // Load initial stores
      loadStores();
    }
  }, [isOpen, order]);

  const loadStores = async () => {
    setLoadingStores(true);
    try {
      const storesData = await adminApi.getPathaoStores().catch(() => []);
      setStores(storesData);
      if (storesData.length > 0) {
        setSelectedStoreId(storesData[0].store_id);
      }
    } catch (err: any) {
      // Non-fatal
    } finally {
      setLoadingStores(false);
    }
  };

  // Estimate Fee
  const handleEstimateFee = async () => {
    if (!selectedStoreId) {
      setErrorMessage("Please select a pickup store first.");
      return;
    }
    setIsEstimating(true);
    setErrorMessage(null);
    try {
      const activeWeight = weightOverride ? parseFloat(weightOverride) : calculatedWeightKg;
      const res = await adminApi.calculatePathaoPrice({
        store_id: selectedStoreId,
        item_type: 2,
        delivery_type: deliveryType,
        item_weight: activeWeight,
        recipient_city: locationValue.cityId,
        recipient_zone: locationValue.zoneId,
      });
      setEstimatedFee(res.price);
    } catch (err: any) {
      setErrorMessage(`Estimate failed: ${err.message}`);
    } finally {
      setIsEstimating(false);
    }
  };

  // Submit Dispatch
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanName = recipientName.trim();
    const cleanPhone = recipientPhone.trim();
    const cleanAddress = recipientAddress.trim();

    if (cleanName.length < 3) {
      setErrorMessage("Recipient name must be at least 3 characters.");
      return;
    }

    if (!/^01\d{9}$/.test(cleanPhone)) {
      setErrorMessage("Recipient phone must be an 11-digit Bangladeshi mobile number (01XXXXXXXXX).");
      return;
    }

    if (recipientSecondaryPhone.trim() && !/^01\d{9}$/.test(recipientSecondaryPhone.trim())) {
      setErrorMessage("Secondary phone must be an 11-digit mobile number (01XXXXXXXXX).");
      return;
    }

    if (cleanAddress.length < 10) {
      setErrorMessage("Recipient address must be at least 10 characters long.");
      return;
    }

    if (cleanAddress.length > 220) {
      setErrorMessage("Recipient address cannot exceed 220 characters.");
      return;
    }

    if (!locationValue.isValid || !locationValue.cityId || !locationValue.zoneId || !locationValue.areaId) {
      setErrorMessage("Please select a valid City, Zone, and Area with home delivery support.");
      return;
    }

    let parsedOverride: number | undefined = undefined;
    if (weightOverride.trim()) {
      parsedOverride = parseFloat(weightOverride);
      if (isNaN(parsedOverride) || parsedOverride < 0.5 || parsedOverride > 10.0) {
        setErrorMessage("Weight override must be between 0.5 kg and 10.0 kg.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await adminApi.dispatchOrderToPathao(orderType, order._id, {
        recipientName: cleanName,
        recipientPhone: cleanPhone,
        recipientSecondaryPhone: recipientSecondaryPhone.trim() || undefined,
        recipientAddress: cleanAddress,
        recipientCity: locationValue.cityId,
        recipientZone: locationValue.zoneId,
        recipientArea: locationValue.areaId,
        recipientCityName: locationValue.cityName,
        recipientZoneName: locationValue.zoneName,
        recipientAreaName: locationValue.areaName,
        storeId: selectedStoreId,
        deliveryType,
        itemType: 2,
        specialInstruction: specialInstruction.trim() || undefined,
        weightOverride: parsedOverride,
      });

      onSuccess(res.shipment);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to dispatch order to Pathao Courier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

  const orderNumber =
    orderType === "sale"
      ? `ORD-${String(order._id).slice(-6).toUpperCase()}`
      : order.preOrderNo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <FaTruck className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Send to Pathao Courier</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/25">
                  Hermes API v1
                </span>
              </div>
              <p className="text-xs text-rose-100 font-medium">
                Dispatching Order: <span className="font-mono font-bold text-white">{orderNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-3 animate-fade-in">
              <FaExclamationTriangle className="text-red-500 shrink-0 text-sm mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Section 1: Customer & Recipient Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <FaMapMarkerAlt className="text-red-600" />
              <span>1. Recipient Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recipient Mobile Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="017XXXXXXXX (11 digits)"
                  className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Delivery Address (10 - 220 chars) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="House, Road, Block/Sector, Area, City"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
              />
              <div className="text-[11px] text-slate-400 text-right">
                {recipientAddress.length} / 220 characters
              </div>
            </div>
          </div>

          {/* Section 2: Store & Cascading Location Selectors */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <FaStore className="text-red-600" />
                <span>2. Store & Pathao Delivery Coverage</span>
              </div>
              {loadingStores && (
                <span className="flex items-center gap-1 text-[11px] font-normal text-slate-500 lowercase">
                  <FaSpinner className="animate-spin text-red-500" /> loading stores...
                </span>
              )}
            </div>

            {/* Store select */}
            {stores.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Store / Warehouse
                </label>
                <select
                  value={selectedStoreId || ""}
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                >
                  {stores.map((s) => (
                    <option key={s.store_id} value={s.store_id}>
                      {s.store_name} ({s.store_address || "Default Hub"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Reusable Cascading City, Zone, Area Picker */}
            <PathaoLocationPicker
              initialCityId={order?.recipientCity || order?.pathaoCityId}
              initialZoneId={order?.recipientZone || order?.pathaoZoneId}
              initialAreaId={order?.recipientArea || order?.pathaoAreaId}
              onChange={setLocationValue}
            />
          </div>

          {/* Section 3: Weight, Parcel & Financial Review */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <FaWeightHanging className="text-red-600" />
              <span>3. Package Weight & Financial Review</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Delivery Speed / Type
                </label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(Number(e.target.value) as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
                >
                  <option value={48}>Normal Delivery (48 Hours)</option>
                  <option value={12}>On Demand / Express (12 Hours)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Billable Weight (kg)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="10.0"
                    placeholder={`Calc: ${calculatedWeightKg} kg`}
                    value={weightOverride}
                    onChange={(e) => setWeightOverride(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">
                    (Auto: {calculatedWeightKg} kg)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={specialInstruction}
                onChange={(e) => setSpecialInstruction(e.target.value)}
                placeholder="e.g. Handle with care - Glass jar, deliver before 6 PM"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>

            {/* Financial Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <FaMoneyBillWave className="text-emerald-600" />
                  <span>Amount to Collect (COD):</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    ৳ {computedAmountToCollect.toLocaleString()}
                  </span>
                  {isPaidUpfront && (
                    <span className="block text-[10px] font-semibold text-emerald-600">
                      Paid Upfront (৳0 COD)
                    </span>
                  )}
                </div>
              </div>

              {/* Fee estimate line */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <FaCalculator className="text-slate-400" />
                  <span>Estimated Courier Cost:</span>
                  {estimatedFee !== null ? (
                    <span className="font-bold text-slate-800 font-mono">
                      ৳ {estimatedFee}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Not calculated</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleEstimateFee}
                  disabled={isEstimating}
                  className="px-2.5 py-1 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  {isEstimating ? "Calculating..." : "Check Fee"}
                </button>
              </div>
            </div>
          </div>

          {/* Notice Alert */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2.5">
            <FaInfoCircle className="text-amber-500 shrink-0 mt-0.5 text-sm" />
            <div>
              <strong>Manual Dispatch Guard:</strong> This will register a real shipment consignment
              on Pathao Hermes. It will automatically record the courier delivery fee in Hatkhola Bazar&apos;s
              costing and profit ledger.
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !locationValue.isValid}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin text-base" />
                  <span>Dispatching to Pathao...</span>
                </>
              ) : (
                <>
                  <FaTruck className="text-base" />
                  <span>Dispatch via Pathao</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
