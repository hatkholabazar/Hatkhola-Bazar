import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { FaArrowLeft, FaShieldAlt, FaWhatsapp, FaPhoneAlt, FaCheckCircle, FaUndoAlt } from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Return & Refund Policy | Hatkhola-Bazar",
  description:
    "100% customer satisfaction guarantee from Hatkhola-Bazar. Free doorstep inspection, prompt replacements, and no-hassle refunds.",
};

export default function RefundPolicyPage() {
  const { business } = siteConfig;
  const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    `Hi ${business.name}, I have an inquiry regarding Return/Refund.`
  )}`;

  return (
    <div className="min-h-screen bg-amber-50/20 text-slate-800 pb-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition whitespace-nowrap"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back to Home</span>
          </Link>
        </div>
        {/* Page Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
            <FaShieldAlt className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Return & Refund Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Last updated: October 2026 • Your complete satisfaction is our highest commitment
          </p>
        </div>

        {/* Commitment Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500 to-primary text-white shadow-lg mb-8">
          <h2 className="text-lg sm:text-xl font-black mb-2 flex items-center gap-2">
            <FaUndoAlt className="w-5 h-5 text-orange-200" />
            Our 100% Satisfaction & Replacement Promise
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
            At Hatkhola-Bazar, we stand firmly behind the authenticity and culinary purity of every product we supply. If any item does not meet your expectations, arrives compromised, or fails our purity promise, we will immediately provide a free replacement or a 100% refund without hesitation.
          </p>
        </div>

        {/* Policy Sections */}
        <div className="bg-white rounded-3xl border border-orange-200/80 shadow-sm p-5 sm:p-10 space-y-8">
          {/* 1. Doorstep Inspection */}
          <section className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-primary text-xs font-black flex items-center justify-center font-sans shrink-0">
                1
              </span>
              <span>Doorstep Package Inspection</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-8">
              We actively encourage you to inspect your parcel in front of the courier rider upon delivery. If the jar seal is broken, damaged during transit, or shows leakage, you can immediately return the parcel to the rider. You will not be charged any delivery fee.
            </p>
          </section>

          {/* 2. Eligible Conditions */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-primary text-xs font-black flex items-center justify-center font-sans shrink-0">
                2
              </span>
              <span>Eligible Conditions for Return or Replacement</span>
            </h3>
            <div className="pl-0 sm:pl-8 space-y-2 text-xs sm:text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Damaged Goods:</strong> Jars or containers cracked or leaked during courier handling.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Incorrect Item:</strong> In the rare event an item differs from what you specified.</span>
              </div>
              <div className="flex items-start gap-2">
                <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Quality Discrepancy:</strong> Any irregularity in natural aroma, consistency, or taste.</span>
              </div>
            </div>
          </section>

          {/* 3. Reporting Window */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-primary text-xs font-black flex items-center justify-center font-sans shrink-0">
                3
              </span>
              <span>Notification Window</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-8">
              Please notify us within <strong>24 to 48 hours</strong> of receipt by sending a photo or brief message to our WhatsApp support desk or customer hotline. We will resolve your claim promptly.
            </p>
          </section>

          {/* 4. Refund Processing */}
          <section className="space-y-3 pt-6 border-t border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-100 text-primary text-xs font-black flex items-center justify-center font-sans shrink-0">
                4
              </span>
              <span>How & When Refunds Are Processed</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-0 sm:pl-8">
              Upon approval, a replacement will be dispatched the same day, or a full refund will be transferred within <strong>24 hours</strong> directly to your bKash, Nagad, or bank account.
            </p>
          </section>

          {/* 5. Contact Options */}
          <section className="pt-6 border-t border-slate-100 pl-0 sm:pl-8">
            <h4 className="text-sm font-bold text-slate-900 mb-3">Direct Support Channels:</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
              >
                <FaWhatsapp className="w-4 h-4 shrink-0" />
                <span>Contact via WhatsApp</span>
              </a>

              <a
                href={`tel:${business.phoneRaw}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm whitespace-nowrap transition cursor-pointer"
              >
                <FaPhoneAlt className="w-3.5 h-3.5 shrink-0" />
                <span>Call Helpline ({business.phone})</span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
