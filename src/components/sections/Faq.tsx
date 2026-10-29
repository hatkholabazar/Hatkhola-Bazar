"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { FaTruck, FaMoneyBillWave, FaShieldAlt, FaQuestionCircle } from "react-icons/fa";
import { siteConfig, FaqItem } from "@/data/siteConfig";

export default function Faq() {
  const { faqs } = siteConfig;
  const [openId, setOpenId] = useState<string | null>("faq-1");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white border-b border-orange-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-orange-50 px-3.5 py-1 rounded-full border border-orange-200">
            Delivery & FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Clear answers about our delivery timelines, payment options, and quality guarantee.
          </p>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-primary flex items-center justify-center shrink-0 shadow-2xs">
              <FaTruck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Nationwide Delivery</h4>
              <p className="text-3xs text-slate-500">24-72 hours careful courier transit</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
              <FaMoneyBillWave className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Cash on Delivery (COD)</h4>
              <p className="text-3xs text-slate-500">bKash & Nagad payments accepted</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
              <FaShieldAlt className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">100% Return Guarantee</h4>
              <p className="text-3xs text-slate-500">Inspect before paying at doorstep</p>
            </div>
          </div>
        </div>

        {/* Accessible Accordion */}
        <div className="space-y-3">
          {faqs.map((faq: FaqItem) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-orange-200/80 bg-orange-50/20 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  id={`accordion-btn-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`accordion-panel-${faq.id}`}
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-primary transition-colors cursor-pointer bg-white"
                >
                  <span className="text-sm sm:text-base pr-4 flex items-center gap-2.5">
                    <FaQuestionCircle className="text-orange-400 w-4 h-4 shrink-0" />
                    <span>{faq.question}</span>
                  </span>
                  <FiChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div
                    id={`accordion-panel-${faq.id}`}
                    role="region"
                    aria-labelledby={`accordion-btn-${faq.id}`}
                    className="p-5 pt-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-orange-50/40 border-t border-orange-100"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
