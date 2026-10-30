"use client";

import { FaUserShield } from "react-icons/fa";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({
  title,
  subtitle,
  actions,
}: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 sticky top-0 z-20 shadow-2xs">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
        {actions}

        {/* Admin User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <FaUserShield className="text-xs" />
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="text-xs font-bold text-slate-800">Administrator</p>
            <p className="text-[10px] text-slate-400">Hatkhola Bazar</p>
          </div>
        </div>
      </div>
    </header>
  );
}
