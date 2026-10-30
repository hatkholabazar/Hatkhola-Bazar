import React from "react";
import hotToast, { ToastOptions } from "react-hot-toast";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";

export interface CustomToastOptions extends ToastOptions {
  id?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Sanitizes raw error messages to prevent leaking secrets, passwords, or stack traces
 */
function sanitizeMessage(msg: string): string {
  if (!msg) return "An unexpected error occurred.";

  let safe = msg;

  // Mask tokens, passwords, secrets
  safe = safe.replace(/(password|secret|token|key|credential|bearer)=?[^\s&]+/gi, "$1=***");
  // Mask 11-digit BD phone numbers if accidentally included in raw errors
  safe = safe.replace(/(?:\+?88)?01[3-9]\d{8}/g, "01XXXXXXXXX");
  // Strip stack trace paths
  safe = safe.split("\n")[0];

  return safe;
}

export const toast = {
  success: (message: string, opts?: CustomToastOptions) => {
    const cleanMsg = sanitizeMessage(message);
    return hotToast(
      (t) =>
        React.createElement(
          "div",
          {
            className: "flex items-center justify-between gap-3 w-full",
            role: "status",
            "aria-live": "polite",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-2.5 min-w-0" },
            React.createElement(FiCheckCircle, {
              className: "w-5 h-5 text-emerald-500 shrink-0",
            }),
            React.createElement(
              "span",
              { className: "text-xs sm:text-sm font-semibold text-slate-800 break-words" },
              cleanMsg
            )
          ),
          opts?.action &&
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => {
                  opts.action?.onClick();
                  hotToast.dismiss(t.id);
                },
                className:
                  "px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition",
              },
              opts.action.label
            )
        ),
      {
        duration: 4000,
        id: opts?.id,
        className:
          "border-l-4 border-l-emerald-500 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-100 p-3.5",
        ...opts,
      }
    );
  },

  error: (message: string, opts?: CustomToastOptions) => {
    const cleanMsg = sanitizeMessage(message);
    return hotToast(
      (t) =>
        React.createElement(
          "div",
          {
            className: "flex items-center justify-between gap-3 w-full",
            role: "alert",
            "aria-live": "assertive",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-2.5 min-w-0" },
            React.createElement(FiXCircle, {
              className: "w-5 h-5 text-rose-500 shrink-0",
            }),
            React.createElement(
              "span",
              { className: "text-xs sm:text-sm font-semibold text-slate-800 break-words" },
              cleanMsg
            )
          ),
          React.createElement(
            "div",
            { className: "flex items-center gap-2 shrink-0" },
            opts?.action &&
              React.createElement(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    opts.action?.onClick();
                    hotToast.dismiss(t.id);
                  },
                  className:
                    "px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition",
                },
                opts.action.label
              ),
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => hotToast.dismiss(t.id),
                "aria-label": "Dismiss error",
                className: "p-1 text-slate-400 hover:text-slate-600 rounded-lg transition",
              },
              React.createElement(FiX, { className: "w-4 h-4" })
            )
          )
        ),
      {
        duration: 6000,
        id: opts?.id,
        className:
          "border-l-4 border-l-rose-500 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-100 p-3.5",
        ...opts,
      }
    );
  },

  warning: (message: string, opts?: CustomToastOptions) => {
    const cleanMsg = sanitizeMessage(message);
    return hotToast(
      (t) =>
        React.createElement(
          "div",
          {
            className: "flex items-center justify-between gap-3 w-full",
            role: "alert",
            "aria-live": "polite",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-2.5 min-w-0" },
            React.createElement(FiAlertTriangle, {
              className: "w-5 h-5 text-amber-500 shrink-0",
            }),
            React.createElement(
              "span",
              { className: "text-xs sm:text-sm font-semibold text-slate-800 break-words" },
              cleanMsg
            )
          ),
          opts?.action &&
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => {
                  opts.action?.onClick();
                  hotToast.dismiss(t.id);
                },
                className:
                  "px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition",
              },
              opts.action.label
            )
        ),
      {
        duration: 5000,
        id: opts?.id,
        className:
          "border-l-4 border-l-amber-500 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-100 p-3.5",
        ...opts,
      }
    );
  },

  info: (message: string, opts?: CustomToastOptions) => {
    const cleanMsg = sanitizeMessage(message);
    return hotToast(
      (t) =>
        React.createElement(
          "div",
          {
            className: "flex items-center justify-between gap-3 w-full",
            role: "status",
            "aria-live": "polite",
          },
          React.createElement(
            "div",
            { className: "flex items-center gap-2.5 min-w-0" },
            React.createElement(FiInfo, {
              className: "w-5 h-5 text-blue-500 shrink-0",
            }),
            React.createElement(
              "span",
              { className: "text-xs sm:text-sm font-semibold text-slate-800 break-words" },
              cleanMsg
            )
          ),
          opts?.action &&
            React.createElement(
              "button",
              {
                type: "button",
                onClick: () => {
                  opts.action?.onClick();
                  hotToast.dismiss(t.id);
                },
                className:
                  "px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition",
              },
              opts.action.label
            )
        ),
      {
        duration: 4000,
        id: opts?.id,
        className:
          "border-l-4 border-l-blue-500 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-100 p-3.5",
        ...opts,
      }
    );
  },

  loading: (message: string, opts?: CustomToastOptions) => {
    const cleanMsg = sanitizeMessage(message);
    return hotToast.loading(
      React.createElement(
        "div",
        {
          className: "flex items-center gap-2.5",
          role: "status",
          "aria-live": "polite",
        },
        React.createElement("span", {
          className: "text-xs sm:text-sm font-semibold text-slate-800",
        }, cleanMsg)
      ),
      {
        id: opts?.id,
        className:
          "border-l-4 border-l-orange-500 bg-white text-slate-800 shadow-xl rounded-2xl border border-slate-100 p-3.5",
        ...opts,
      }
    );
  },

  dismiss: (id?: string) => {
    hotToast.dismiss(id);
  },

  custom: hotToast.custom,
  promise: hotToast.promise,
};

// Aliases for compatibility
export const notify = toast;
export default toast;

