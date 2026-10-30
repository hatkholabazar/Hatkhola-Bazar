"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FaArrowLeft,
  FaShieldAlt,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaCheckCircle,
  FaUndoAlt,
  FaCalendarAlt,
  FaBoxOpen,
  FaExchangeAlt,
  FaTruck,
  FaMoneyBillWave,
  FaExclamationTriangle,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function RefundPolicyPage() {
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const { business } = siteConfig;

  const whatsappUrl = `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    language === "bn"
      ? `আসসালামু আলাইকুম, হাটখোলা বাজার। আমার অর্ডার সম্পর্কিত রিটার্ন/রিফান্ড বিষয়ে কিছু তথ্য জানতে চাই।`
      : `Hi ${business.name}, I have an inquiry regarding Return/Refund.`
  )}`;

  return (
    <div className="min-h-screen bg-amber-50/20 text-slate-800 pb-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Top Navigation & Language Switcher */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition whitespace-nowrap"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>{language === "bn" ? "মূল পাতায় ফিরুন" : "Back to Home"}</span>
          </Link>

          {/* Language Toggle Switcher */}
          <div className="inline-flex p-1 rounded-xl bg-orange-100/80 border border-orange-200">
            <button
              type="button"
              onClick={() => setLanguage("bn")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                language === "bn"
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              বাংলা (বাং)
            </button>
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                language === "en"
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English (EN)
            </button>
          </div>
        </div>

        {/* Header Banner */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
            <FaShieldAlt className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            {language === "bn" ? "রিটার্ন এবং রিফান্ড নীতি" : "Return & Refund Policy"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 font-medium">
            {language === "bn"
              ? "হাটখোলা বাজার • কাস্টমারের সন্তুষ্টিই আমাদের অর্জন"
              : "Hatkhola Bazar • Customer satisfaction is our ultimate achievement"}
          </p>
        </div>

        {/* Core Promise Callout */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-orange-500 to-primary text-white shadow-lg mb-8">
          <h2 className="text-base sm:text-lg font-black mb-2 flex items-center gap-2">
            <FaUndoAlt className="w-5 h-5 text-orange-200 shrink-0" />
            <span>
              {language === "bn"
                ? "আমাদের আন্তরিক অঙ্গীকার"
                : "Our Authentic Quality & Replacement Promise"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed font-medium">
            {language === "bn"
              ? "আমরা আমাদের রিটার্ন এন্ড রিফান্ড পলিসি যথাসম্ভব সহজ রাখার চেষ্টা করেছি যাতে কাস্টোমার আমাদের বিশ্বাস করতে পারে ইং শা আল্লাহ্। আমরা অবশ্যই এই বিশ্বাসের প্রতিদান দিবো ইং শা আল্লাহ্। কাস্টমারের সন্তুষ্টি আমাদের অর্জন।"
              : "We strive to keep our return and refund policy as straightforward and transparent as possible so you can place complete trust in Hatkhola Bazar Insha'Allah. We honor and uphold this trust with sincerity Insha'Allah. Customer satisfaction is our highest achievement."}
          </p>
        </div>

        {/* BENGALI CONTENT */}
        {language === "bn" && (
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-sm p-5 sm:p-9 space-y-7">
            {/* ১. রিটার্ন উইন্ডো */}
            <section className="space-y-2.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ১
                </span>
                <span>রিটার্ন উইন্ডো:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                হাটখোলা বাজার থেকে কেনা সমস্ত পণ্য কেনার তারিখ থেকে <strong>১০ দিনের মধ্যে</strong> ফেরত দেওয়া যেতে পারে।
              </p>
            </section>

            {/* ২. রিটার্ন শর্ত */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ২
                </span>
                <span>রিটার্ন শর্ত:</span>
              </h3>
              <ul className="pl-0 sm:pl-9 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>পণ্যগুলি অবশ্যই তাদের মূল অবস্থায়, অব্যবহৃত এবং সমস্ত ট্যাগ এবং লেবেল সংযুক্ত থাকতে হবে।</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>নষ্ট হওয়া পণ্য ফেরত দেওয়া যাবে না।</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>কাস্টমাইজড বা ব্যক্তিগতকৃত পণ্য সাধারণত ফেরতযোগ্য নয়।</span>
                </li>
              </ul>
            </section>

            {/* ৩. রিটার্ন প্রক্রিয়া */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ৩
                </span>
                <span>রিটার্ন প্রক্রিয়া:</span>
              </h3>
              <ul className="pl-0 sm:pl-9 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FaPhoneAlt className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                  <span>
                    রিটার্ন করার জন্য, দয়া করে আমাদের সাথে <strong>01979333880</strong> বা{" "}
                    <strong>hatkhola.bazar23@gmail.com</strong> এ অথবা আমাদের অফিসিয়াল ফেসবুক পেজ এ যোগাযোগ করুন।
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBoxOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>আপনার অর্ডার নম্বর এবং রিটার্ন করার কারণ প্রদান করুন।</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaTruck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>আপনাকে পণ্যগুলো ফেরত দেওয়ার নির্দেশনা দেওয়া হবে।</span>
                </li>
              </ul>
            </section>

            {/* ৪. রিটার্ন শিপিং */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ৪
                </span>
                <span>রিটার্ন শিপিং:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                যদি পণ্যটি ত্রুটিপূর্ণ হয় বা ভুল পণ্য পাঠানো হয়, আমরা রিটার্ন শিপিং খরচ বহন করব।
              </p>
            </section>

            {/* ৫. রিফান্ড পদ্ধতি */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ৫
                </span>
                <span>রিফান্ড পদ্ধতি:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                রিফান্ডগুলি ফেরত করা পণ্য(গুলি) পাওয়ার <strong>৩-৫ ব্যবসায়িক দিনের মধ্যে</strong> কাস্টোমার এর পেইমেন্ট মেথড (নগদ, বিকাশ, সেলফিন) এ প্রদান করা হবে ইং শা আল্লাহ্।
              </p>
            </section>

            {/* ৬. বিনিময় */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ৬
                </span>
                <span>বিনিময় (Exchange):</span>
              </h3>
              <ul className="pl-0 sm:pl-9 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FaExchangeAlt className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-1" />
                  <span>কাস্টোমার চাইলে পণ্য এক্সচেঞ্জ করে নিতে পারে ইং শা আল্লাহ্।</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaPhoneAlt className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                  <span>এক্সচেঞ্জে সহায়তা করার জন্য দয়া করে আমাদের সাথে যোগাযোগ করুন।</span>
                </li>
              </ul>
            </section>

            {/* ৮. ক্ষতিগ্রস্ত বা ভুল পণ্য */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  ৭
                </span>
                <span>ক্ষতিগ্রস্ত বা ভুল পণ্য:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                যদি আপনি ক্ষতিগ্রস্ত বা ভুল পণ্য পান, তাহলে দয়া করে প্রাপ্তির <strong>১০ দিনের মধ্যে</strong> আমাদের জানান। আমরা পণ্যটি ফেরত দেওয়ার এবং প্রতিস্থাপন বা রিফান্ড করার জন্য নির্দেশনা প্রদান করব।
              </p>
            </section>

            {/* সরাসরি হেল্পলাইন ও কাস্টমার যোগাযোগ */}
            <section className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 pl-0 sm:pl-9">
                সরাসরি কাস্টমার কেয়ার ও সাপোর্ট:
              </h4>
              <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-9">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
                >
                  <FaWhatsapp className="w-4 h-4 shrink-0" />
                  <span>হোয়াটসঅ্যাপে যোগাযোগ</span>
                </a>

                <a
                  href="tel:01979333880"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5 shrink-0" />
                  <span>সরাসরি কল (01979333880)</span>
                </a>

                <a
                  href="mailto:hatkhola.bazar23@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  <FaEnvelope className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>ইমেইল পাঠান</span>
                </a>
              </div>
            </section>
          </div>
        )}

        {/* ENGLISH CONTENT */}
        {language === "en" && (
          <div className="bg-white rounded-3xl border border-orange-200/80 shadow-sm p-5 sm:p-9 space-y-7">
            {/* 1. Return Window */}
            <section className="space-y-2.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  1
                </span>
                <span>Return Window:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                All products purchased from Hatkhola Bazar can be returned within <strong>10 days</strong> from the date of purchase.
              </p>
            </section>

            {/* 2. Return Conditions */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Return Conditions:</span>
              </h3>
              <ul className="pl-0 sm:pl-9 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Items must be in their original condition, unused, with all tags and labels intact.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Spoiled or perished products cannot be returned once expired.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaCheckCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>Customized or personalized items are generally non-refundable.</span>
                </li>
              </ul>
            </section>

            {/* 3. Return Process */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <span>Return Process:</span>
              </h3>
              <ul className="pl-0 sm:pl-9 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FaPhoneAlt className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                  <span>
                    To initiate a return, contact us at <strong>01979333880</strong>, via email at{" "}
                    <strong>hatkhola.bazar23@gmail.com</strong>, or message our official Facebook page.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <FaBoxOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>Provide your Order Number and the reason for the return.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaTruck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>You will be given clear courier pickup/handover instructions.</span>
                </li>
              </ul>
            </section>

            {/* 4. Return Shipping */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  4
                </span>
                <span>Return Shipping:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                If the product is defective or an incorrect item was dispatched, Hatkhola Bazar will bear 100% of the return shipping costs.
              </p>
            </section>

            {/* 5. Refund Method */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  5
                </span>
                <span>Refund Method:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                Refunds will be processed within <strong>3-5 business days</strong> of receiving the returned item(s), credited directly to your payment method (Cash, bKash, Nagad, Cellfin) Insha&apos;Allah.
              </p>
            </section>

            {/* 6. Exchanges */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  6
                </span>
                <span>Product Exchange:</span>
              </h3>
              <ul className="pl-0 sm:pl-9 space-y-2 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <FaExchangeAlt className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-1" />
                  <span>Customers can request a product exchange if preferred Insha&apos;Allah.</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaPhoneAlt className="w-3.5 h-3.5 text-primary shrink-0 mt-1" />
                  <span>Please contact us directly to facilitate an exchange.</span>
                </li>
              </ul>
            </section>

            {/* 7. Damaged or Incorrect Products */}
            <section className="space-y-2.5 pt-6 border-t border-slate-100">
              <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-primary text-xs font-black flex items-center justify-center shrink-0">
                  7
                </span>
                <span>Damaged or Incorrect Goods:</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-9">
                If you receive damaged or incorrect goods, please notify us within <strong>10 days</strong> of receipt. We will provide prompt instructions for returning the product and arranging an immediate replacement or full refund.
              </p>
            </section>

            {/* Support Channels */}
            <section className="pt-6 border-t border-slate-100">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 pl-0 sm:pl-9">
                Direct Customer Support Channels:
              </h4>
              <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-9">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
                >
                  <FaWhatsapp className="w-4 h-4 shrink-0" />
                  <span>Contact WhatsApp Desk</span>
                </a>

                <a
                  href="tel:01979333880"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-sm"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5 shrink-0" />
                  <span>Call 01979333880</span>
                </a>

                <a
                  href="mailto:hatkhola.bazar23@gmail.com"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  <FaEnvelope className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Send Email</span>
                </a>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
