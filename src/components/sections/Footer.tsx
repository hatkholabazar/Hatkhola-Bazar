"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaFacebookF,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
  FaPaperPlane,
  FaCheck,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function Footer() {
  const { business } = siteConfig;
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setIsSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="relative bg-[#09090b] text-neutral-400 border-t border-white/10 pt-12 sm:pt-16 pb-10 overflow-hidden">
      {/* Subtle Theme Color Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-5xl h-36 bg-gradient-to-b from-orange-500/15 via-orange-600/5 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-8">
          {/* Left Card: Logo + Brand + Stay in touch! + Socials */}
          <div className="lg:col-span-4 bg-gradient-to-b from-neutral-900/90 via-neutral-900/70 to-neutral-950/90 border border-white/10 hover:border-orange-500/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group transition-all duration-300">
            {/* Ambient orange glow inside card */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Brand Logo & Name */}
              <Link href="/" className="inline-flex items-center gap-3 group/brand">
                <div className="w-10 h-10 rounded-xl bg-white/95 p-1.5 flex items-center justify-center shrink-0 border border-white/20 shadow-sm group-hover/brand:scale-105 transition-transform">
                  <Image
                    src="/hatkhola-logo.png"
                    alt="Hatkhola Bazar Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-white tracking-tight leading-tight group-hover/brand:text-primary transition-colors">
                    {business.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">
                    Pure & Natural
                  </span>
                </div>
              </Link>

              <p className="text-xs sm:text-sm text-neutral-400 mt-4 leading-relaxed">
                {business.subTagline}
              </p>
            </div>

            {/* Bottom Row: Stay in touch! + Square Social Icons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                Stay in touch!
              </span>

              <div className="flex items-center gap-2">
                <a
                  href={business.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white text-neutral-300 hover:text-black flex items-center justify-center transition cursor-pointer"
                >
                  <FaFacebookF className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
                    "Hi Hatkhola Bazar, I want to stay in touch!"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-emerald-500 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <FaWhatsapp className="w-4 h-4" />
                </a>

                <a
                  href={`tel:${business.phoneRaw}`}
                  aria-label="Call Helpline"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`mailto:${business.email}`}
                  aria-label="Email Us"
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-amber-500 text-neutral-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <FaEnvelope className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Section: Navigation, Newsletter, Support + Giant Watermark */}
          <div className="lg:col-span-8 bg-neutral-900/30 border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Big Faint Watermark of the Hatkhola Logo (matching reference) */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 opacity-[0.035] pointer-events-none select-none -z-0">
              <Image
                src="/hatkhola-logo.png"
                alt="Watermark"
                width={320}
                height={320}
                className="object-contain filter invert"
              />
            </div>

            {/* Navigation & Newsletter Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
              {/* Col 1: Explore / Works */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                  Explore
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                  <li>
                    <a href="/#products" className="hover:text-primary transition-colors">
                      Artisanal Products
                    </a>
                  </li>
                  <li>
                    <a href="/#why" className="hover:text-primary transition-colors">
                      Why Choose Us
                    </a>
                  </li>
                  <li>
                    <a href="/#reviews" className="hover:text-primary transition-colors">
                      Customer Reviews
                    </a>
                  </li>
                  <li>
                    <a href="/#how" className="hover:text-primary transition-colors">
                      How to Order
                    </a>
                  </li>
                  <li>
                    <a href="/#about" className="hover:text-primary transition-colors">
                      Our Heritage
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 2: Newsletter */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                  Newsletter
                </h4>
                <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
                  Join our seasonal circle for fresh harvest drops and authentic batches.
                </p>

                {isSubscribed ? (
                  <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-orange-500/15 border border-orange-500/30 text-xs font-bold text-orange-300">
                    <FaCheck className="w-3 h-3 text-orange-400" />
                    <span>Subscribed successfully!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="space-y-2">
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email Address"
                        required
                        className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-extrabold transition cursor-pointer shadow-sm shadow-orange-500/20 whitespace-nowrap active:scale-98"
                    >
                      <FaPaperPlane className="w-2.5 h-2.5" />
                      <span>Sign Up</span>
                    </button>
                  </form>
                )}
              </div>

              {/* Col 3: Support */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                  Support
                </h4>
                <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                  <li>
                    <Link href="/refund-policy" className="hover:text-primary transition-colors">
                      Terms & Refund Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="hover:text-primary transition-colors">
                      Order History & Profile
                    </Link>
                  </li>
                  <li>
                    <a href="/#faq" className="hover:text-primary transition-colors">
                      Frequently Asked Questions
                    </a>
                  </li>
                  <li>
                    <a
                      href={`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
                        "Hi Hatkhola Bazar, I would like direct support."
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      WhatsApp Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Sub-bar */}
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 relative z-10">
              <p>© Copyright {year}. {business.name} All Rights Reserved.</p>
              <p className="text-neutral-400 font-medium">
                Powered By <span className="text-white font-bold">hatkholabazar.com</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
