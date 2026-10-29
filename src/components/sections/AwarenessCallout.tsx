import { Hind_Siliguri } from "next/font/google";
import { FaExclamationTriangle } from "react-icons/fa";
import { ProductAwarenessContent } from "@/config/site";

const hindSiliguri = Hind_Siliguri({
  weight: ["400", "600", "700"],
  subsets: ["bengali"],
  display: "swap",
});

interface AwarenessCalloutProps {
  awareness: ProductAwarenessContent;
}

export default function AwarenessCallout({ awareness }: AwarenessCalloutProps) {
  if (!awareness) return null;

  return (
    <aside
      aria-label="গুড় সচেতনতা বার্তা"
      className={`${hindSiliguri.className} bg-[#FFF9F2] border-l-4 border-l-[#F37820] border-t border-r border-b border-orange-200/70 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs text-slate-800 transition-opacity motion-reduce:transition-none motion-reduce:transform-none animate-fade-in`}
    >
      {/* Headline with Warning Icon */}
      <div className="flex items-center gap-2.5 mb-3">
        <FaExclamationTriangle className="w-5 h-5 text-[#F37820] shrink-0" aria-hidden="true" />
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {awareness.headline}
        </h3>
      </div>

      {/* Body Text with Relaxed Line-Height */}
      <p className="text-xs sm:text-sm text-slate-700 leading-[1.8] mb-4">
        {awareness.body}
      </p>

      {/* আসল গুড় চেনার উপায় Sub-list */}
      <div className="mb-4 bg-white/80 rounded-xl p-3.5 sm:p-4 border border-orange-100/90">
        <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-2">
          আসল গুড় চেনার উপায়:
        </h4>
        <ul className="list-disc list-outside pl-5 space-y-1.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {awareness.tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>

      {/* Bold Closing Line */}
      <p className="text-xs sm:text-sm font-bold text-[#C25406] leading-relaxed">
        {awareness.closing}
      </p>
    </aside>
  );
}
