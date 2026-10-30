"use client";

import React, { useEffect, useState } from "react";
import { Toaster, useToasterStore, toast } from "react-hot-toast";

export default function ToasterProvider() {
  const { toasts } = useToasterStore();
  const [offsetBottom, setOffsetBottom] = useState(24);

  // Limit visible toasts to 3 at a time (dismiss oldest when 4th arrives)
  useEffect(() => {
    toasts
      .filter((t) => t.visible)
      .filter((_, i) => i >= 3)
      .forEach((t) => toast.dismiss(t.id));
  }, [toasts]);

  // Read --toast-offset-bottom from CSS variable responsively
  useEffect(() => {
    const updateOffset = () => {
      if (typeof window !== "undefined") {
        const val = getComputedStyle(document.documentElement).getPropertyValue(
          "--toast-offset-bottom"
        );
        const parsed = parseInt(val, 10);
        if (!isNaN(parsed)) {
          setOffsetBottom(parsed);
        } else {
          setOffsetBottom(window.innerWidth < 640 ? 88 : 24);
        }
      }
    };

    updateOffset();
    window.addEventListener("resize", updateOffset);
    return () => window.removeEventListener("resize", updateOffset);
  }, []);

  return (
    <Toaster
      position="bottom-right"
      gutter={10}
      containerStyle={{
        bottom: `${offsetBottom}px`,
        right: "16px",
      }}
      toastOptions={{
        duration: 4500,
        style: {
          maxWidth: "min(92vw, 380px)",
          borderRadius: "16px",
          background: "#ffffff",
          color: "#1e293b",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #f1f5f9",
          fontSize: "14px",
          padding: "12px 14px",
        },
      }}
    />
  );
}

