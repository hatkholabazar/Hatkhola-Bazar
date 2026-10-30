"use client";

import { useState } from "react";
import { FaFilePdf, FaDownload, FaSpinner } from "react-icons/fa";
import type { InvoiceOrderData } from "./OrderInvoicePdf";

interface InvoiceDownloadButtonProps {
  order: InvoiceOrderData;
  className?: string;
  variant?: "primary" | "secondary" | "minimal";
  size?: "sm" | "md";
}

export default function InvoiceDownloadButton({
  order,
  className = "",
  variant = "primary",
  size = "md",
}: InvoiceDownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Dynamically import @react-pdf/renderer and component to keep bundle lightweight
      const [{ pdf, Font }, { OrderInvoicePdf }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./OrderInvoicePdf"),
      ]);

      // Ensure Bengali & Latin Unicode font is fully loaded in font engine before rasterizing
      try {
        await Font.load({ fontFamily: "HindSiliguri" });
      } catch (fontErr) {
        console.warn("Font pre-load notice:", fontErr);
      }

      const blob = await pdf(<OrderInvoicePdf order={order} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Hatkhola-Invoice-${order.orderId || "order"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate invoice PDF:", err);
      alert("Could not generate PDF invoice. Please try again or contact our support.");
    } finally {
      setIsGenerating(false);
    }
  };

  const baseStyles =
    "inline-flex items-center justify-center font-extrabold transition cursor-pointer select-none rounded-xl";

  const sizeStyles =
    size === "sm"
      ? "text-xs py-1.5 px-3 gap-1.5"
      : "text-xs sm:text-sm py-2.5 px-4 gap-2";

  let variantStyles = "";
  if (variant === "primary") {
    variantStyles =
      "bg-orange-600 hover:bg-orange-700 text-white shadow-md active:scale-98 disabled:opacity-50";
  } else if (variant === "secondary") {
    variantStyles =
      "bg-white hover:bg-orange-50 text-slate-800 border border-slate-200 hover:border-orange-300 shadow-2xs active:scale-98 disabled:opacity-50";
  } else if (variant === "minimal") {
    variantStyles =
      "bg-transparent hover:bg-orange-50 text-orange-700 underline text-xs disabled:opacity-50";
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isGenerating}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      aria-label={`Download invoice for order ${order.orderId}`}
    >
      {isGenerating ? (
        <>
          <FaSpinner className="w-3.5 h-3.5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <FaFilePdf className="w-3.5 h-3.5 text-rose-500" />
          <span>Download Invoice (PDF)</span>
          <FaDownload className="w-2.5 h-2.5 opacity-70" />
        </>
      )}
    </button>
  );
}

