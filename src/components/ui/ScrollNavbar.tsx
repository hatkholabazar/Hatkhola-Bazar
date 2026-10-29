"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBars,
  FaTimes,
  FaShoppingBag,
  FaUser,
  FaPhoneAlt,
  FaWhatsapp,
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";

export default function ScrollNavbar() {
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();
  const { business } = siteConfig;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [customerProfile, setCustomerProfile] = useState<{
    name: string;
    phone: string;
  } | null>(null);

  // Load customer profile on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hatkhola_customer_profile");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name || parsed.phone) {
          setCustomerProfile(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Track scroll for subtle shadow/border change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when hamburger menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const handleLogout = () => {
    try {
      localStorage.removeItem("hatkhola_customer_profile");
    } catch {
      // Ignore
    }
    setCustomerProfile(null);
  };

  // Nav links: Products, Why Us, Reviews, How to Order, Profile
  const navLinks = [
    { label: "Products", href: "/#products" },
    { label: "Why Us", href: "/#why" },
    { label: "Reviews", href: "/#reviews" },
    { label: "How to Order", href: "/#how" },
    { label: "Profile", href: "/profile" },
  ];

  // Do not render store navbar on admin or dashboard pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <>
      <header
        aria-label="Main navigation"
        className={`sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md transition-all duration-200 ${
          isScrolled
            ? "border-b border-orange-200/90 shadow-sm py-2.5 sm:py-3"
            : "border-b border-orange-100 py-3 sm:py-3.5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Left: Brand Logo & Name */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group cursor-pointer shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 border border-orange-200 p-1 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              <Image
                src="/hatkhola-logo.png"
                alt="Hatkhola Bazar Logo"
                width={34}
                height={34}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-black text-sm sm:text-base text-slate-900 group-hover:text-primary transition-colors leading-tight tracking-tight whitespace-nowrap">
              {business.name}
            </span>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-bold text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`hover:text-primary transition py-1 ${
                  pathname === link.href ? "text-primary" : ""
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Helpline + Login / Signup + Cart + Hamburger Trigger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Helpline (Desktop XL only) */}
            <a
              href={`tel:${business.phoneRaw}`}
              title="Call Helpline"
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-200 hover:bg-orange-50 text-slate-800 text-xs font-bold whitespace-nowrap transition"
            >
              <FaPhoneAlt className="w-3 h-3 text-primary shrink-0" />
              <span>{business.phone}</span>
            </a>

            {/* Desktop Auth Buttons (in the side of Cart) */}
            {customerProfile?.name ? (
              <div className="hidden sm:inline-flex items-center gap-2">
                <Link
                  href="/profile"
                  title="View Account Profile"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-slate-800 text-xs font-bold whitespace-nowrap transition"
                >
                  <FaUser className="w-3 h-3 text-primary shrink-0" />
                  <span className="max-w-[85px] truncate">
                    {customerProfile.name.split(" ")[0]}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 px-1 py-1 transition cursor-pointer"
                >
                  <FaSignOutAlt className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-1.5">
                {/* Login Link */}
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-primary hover:bg-orange-50 border border-transparent hover:border-orange-200 transition cursor-pointer whitespace-nowrap"
                >
                  Login
                </Link>

                {/* Sign Up Link */}
                <Link
                  href="/signup"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-orange-950 bg-orange-50 hover:bg-orange-100 border border-orange-200 hover:border-orange-300 transition cursor-pointer whitespace-nowrap shadow-2xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Cart Trigger */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label="Open Cart"
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs whitespace-nowrap shadow-md shadow-orange-500/20 transition cursor-pointer transform active:scale-95"
            >
              <FaShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Cart</span>
              {totalCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white text-primary text-3xs sm:text-2xs font-black flex items-center justify-center font-sans">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Hamburger Menu Button (Mobile & Tablet only) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              className="lg:hidden w-10 h-10 rounded-xl bg-orange-50/80 hover:bg-orange-100 border border-orange-200 text-slate-800 hover:text-primary flex items-center justify-center transition cursor-pointer active:scale-95"
            >
              {isMenuOpen ? (
                <FaTimes className="w-4 h-4 text-primary" />
              ) : (
                <FaBars className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hamburger Menu Drawer (Mobile & Tablet only) */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site Navigation Menu"
          className="lg:hidden fixed inset-0 z-50 overflow-hidden animate-fade-in"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col justify-between border-l border-orange-200 animate-slide-in-right">
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-orange-100 flex items-center justify-between bg-orange-50/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-orange-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    <Image
                      src="/hatkhola-logo.png"
                      alt="Hatkhola Bazar Logo"
                      width={28}
                      height={28}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-sm sm:text-base font-black text-slate-900 whitespace-nowrap">
                    {business.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer transition"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                {/* Mobile Cart Trigger */}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    openDrawer();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200/80 text-slate-900 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FaShoppingBag className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-xs font-extrabold whitespace-nowrap">My Cart</span>
                  </div>
                  {totalCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full bg-primary text-white text-3xs font-black font-sans">
                      {totalCount} items
                    </span>
                  ) : (
                    <span className="text-3xs text-slate-400 font-semibold font-sans">Empty</span>
                  )}
                </button>

                {/* Mobile Login / Sign Up or Logged In State */}
                {customerProfile?.name ? (
                  <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 flex items-center justify-between">
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2 text-slate-900 hover:text-primary transition"
                    >
                      <FaUser className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs font-bold truncate max-w-[140px]">
                        {customerProfile.name}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="text-3xs font-bold text-rose-600 hover:underline uppercase"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-orange-200 bg-white hover:bg-orange-50 text-slate-800 text-xs font-bold text-center transition cursor-pointer whitespace-nowrap"
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="py-2.5 px-3 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-950 text-xs font-bold text-center transition cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}

                {/* Section Headlines */}
                <div className="pt-2">
                  <span className="block text-3xs font-extrabold uppercase tracking-widest text-slate-400 mb-2 px-1">
                    Navigation
                  </span>
                  <nav className="flex flex-col space-y-1">
                    {navLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-between py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:bg-orange-50 hover:text-primary transition"
                      >
                        <span className="whitespace-nowrap">{link.label}</span>
                        <FaArrowRight className="w-2.5 h-2.5 text-slate-300" />
                      </a>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Drawer Footer: Call Helpline Button */}
              <div className="p-4 border-t border-orange-100 bg-orange-50/30 space-y-2">
                <a
                  href={`tel:${business.phoneRaw}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs whitespace-nowrap shadow-md shadow-orange-500/20 transition cursor-pointer"
                >
                  <FaPhoneAlt className="w-3.5 h-3.5 shrink-0" />
                  <span>Call {business.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
                    "Hi Hatkhola Bazar, I would like to make an inquiry."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs whitespace-nowrap shadow-xs transition cursor-pointer"
                >
                  <FaWhatsapp className="w-3.5 h-3.5 shrink-0" />
                  <span>WhatsApp Inquiry</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
