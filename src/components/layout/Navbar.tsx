"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  FaTimes,
  FaShoppingBag,
  FaUser,
  FaPhoneAlt,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useCart } from "@/context/CartContext";
import { siteConfig } from "@/data/siteConfig";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalCount, openDrawer } = useCart();
  const { business } = siteConfig;

  const { data: session, isPending, error } = authClient.useSession();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasAdminToken, setHasAdminToken] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasAdminToken(!!localStorage.getItem("hatkhola_admin_token"));
    }
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Track scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll and handle focus trap when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    document.cookie = "hatkhola_admin_token=; path=/; max-age=0; SameSite=Lax";
    try {
      localStorage.removeItem("hatkhola_admin_token");
    } catch {
      // Ignore storage errors
    }
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
          toast.success("You have been signed out.");
        },
        onError: () => {
          toast.error("Failed to sign out. Please try again.");
        },
      },
    });
  };

  // Do not render store navbar on admin or dashboard pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard")) {
    return null;
  }

  const navLinks = [
    { label: "Products", href: "/#products" },
    { label: "Why Us", href: "/#why" },
    { label: "Reviews", href: "/#reviews" },
    { label: "How to Order", href: "/#how" },
  ];

  const isLoggedIn = !!session?.user && !error;
  const userName = session?.user?.name || "Customer";
  const firstName = userName.split(" ")[0] || userName;

  const userRole = session?.user?.role || "user";
  const isAdmin =
    (isLoggedIn && (userRole === "admin" || (session?.user as any)?.isAdmin === true)) ||
    hasAdminToken;

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
          {/* Brand Logo & Name */}
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6 text-xs font-bold text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`hover:text-primary transition py-1 ${
                  pathname === link.href ? "text-primary" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn && (
              <Link
                href="/account/orders"
                className={`hover:text-primary transition py-1 ${
                  pathname === "/account/orders" ? "text-primary" : ""
                }`}
              >
                My Orders
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className={`hover:text-primary transition py-1 ${
                  pathname?.startsWith("/admin")
                    ? "text-primary"
                    : "text-orange-950 font-black"
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Action Cluster */}
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

            {/* Desktop Auth Controls */}
            <div className="hidden sm:inline-flex items-center gap-1.5">
              {isPending ? (
                /* Skeleton while checking authentication */
                <div
                  aria-hidden="true"
                  className="w-32 h-8 bg-slate-100 rounded-xl animate-pulse"
                />
              ) : isLoggedIn ? (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/profile"
                    title={`User Profile - ${userName}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-200 bg-orange-50/70 hover:bg-orange-100 text-slate-800 text-xs font-bold whitespace-nowrap transition"
                  >
                    <FaUser className="w-3 h-3 text-primary shrink-0" />
                    <span className="max-w-[90px] truncate">{firstName}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    aria-label="Sign out"
                    title="Sign out"
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition cursor-pointer"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Link
                    href="/sign-in"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-primary hover:bg-orange-50 border border-transparent hover:border-orange-200 transition cursor-pointer whitespace-nowrap"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-xs transition cursor-pointer whitespace-nowrap"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>

            {/* Cart Trigger Button */}
            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Open Cart with ${totalCount} items`}
              className="relative p-2 rounded-xl border border-orange-200/80 bg-orange-50/60 hover:bg-orange-100 text-primary transition cursor-pointer flex items-center justify-center shrink-0"
            >
              <FaShoppingBag className="w-4 h-4" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-black font-mono flex items-center justify-center shadow-xs">
                  {totalCount > 9 ? "9+" : totalCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-primary hover:bg-orange-50 transition border border-slate-200"
            >
              {isMenuOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <RxHamburgerMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Backdrop & Menu */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          ref={drawerRef}
          tabIndex={-1}
          className="fixed inset-0 z-50 lg:hidden focus:outline-hidden"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs animate-fade-in"
          />

          {/* Drawer Menu */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-slide-in-right z-10 border-l border-orange-100">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <Link
                  href="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-50 p-1 flex items-center justify-center">
                    <Image
                      src="/hatkhola-logo.png"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                  <span className="font-extrabold text-sm text-slate-900">
                    {business.name}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* User Profile Card (if logged in) */}
              {isLoggedIn && (
                <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {userName}
                        </span>
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-primary text-white uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {session?.user?.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-1.5 text-sm font-bold text-slate-700">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl hover:bg-orange-50 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                ))}

                {isLoggedIn && (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-orange-50 hover:text-primary transition"
                    >
                      My Profile ({firstName})
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2.5 rounded-xl hover:bg-orange-50 hover:text-primary transition"
                    >
                      My Orders
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2.5 rounded-xl bg-orange-100/70 hover:bg-orange-100 text-orange-950 font-black transition border border-orange-200 shadow-2xs"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </nav>
            </div>

            {/* Drawer Footer Auth Actions */}
            <div className="pt-6 border-t border-slate-100 space-y-3">
              {isPending ? (
                <div className="w-full h-10 bg-slate-100 rounded-xl animate-pulse" />
              ) : isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-center border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 px-3 rounded-xl text-center bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs transition"
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {/* Support Hotline */}
              <div className="pt-2 text-center">
                <a
                  href={`tel:${business.phoneRaw}`}
                  className="text-[11px] font-semibold text-slate-500 hover:text-primary transition flex items-center justify-center gap-1.5"
                >
                  <FaPhoneAlt className="w-3 h-3 text-primary" />
                  <span>Hotline: {business.phone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

