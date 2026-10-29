"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
  FaShieldAlt,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";

export default function LoginPage() {
  const { business } = siteConfig;
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-amber-50/20 to-white text-slate-800 pb-20 pt-6 sm:pt-10">
      <main className="max-w-md mx-auto px-4 sm:px-6">
        {/* Top Header: Back to Home */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-primary transition whitespace-nowrap"
          >
            <FaArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center group">
            <div className="w-14 h-14 rounded-2xl bg-white border border-orange-200 p-2 flex items-center justify-center shadow-md shadow-orange-500/10 group-hover:scale-105 transition-transform mb-3">
              <Image
                src="/hatkhola-logo.png"
                alt="Hatkhola Bazar Logo"
                width={44}
                height={44}
                priority
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {business.name}
            </h1>
            <p className="text-xs font-bold text-orange-700/80 uppercase tracking-widest mt-0.5">
              Welcome Back
            </p>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Sign in to track orders, manage deliveries, and view purchase history
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-orange-200/90 shadow-xl shadow-orange-500/5 p-6 sm:p-8 space-y-5">
          <form className="space-y-4">
            {/* Email Address Only */}
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50 focus:bg-white"
                />
                <FaEnvelope className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Password *
                </label>
                <a
                  href="#"
                  className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
                >
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition cursor-pointer"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded-md border-slate-300 text-primary focus:ring-primary cursor-pointer accent-orange-600"
              />
              <label
                htmlFor="remember"
                className="text-xs font-semibold text-slate-600 cursor-pointer"
              >
                Keep me logged in on this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap shadow-md shadow-orange-500/25 transition cursor-pointer transform active:scale-98 flex items-center justify-center gap-2 mt-2"
            >
              <FaSignInAlt className="w-4 h-4 shrink-0" />
              <span>Login to Account</span>
            </button>
          </form>

          {/* Quick Security note */}
          <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200/70 text-center">
            <span className="text-xs font-semibold text-orange-950 flex items-center justify-center gap-1.5">
              <FaShieldAlt className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>Fast & secure login for genuine village foods</span>
            </span>
          </div>

          {/* Switch to Sign Up */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Don’t have an account yet?{" "}
              <Link
                href="/signup"
                className="font-bold text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
              >
                <FaUserPlus className="w-3 h-3" />
                <span>Create an Account</span>
              </Link>
            </p>
          </div>
        </div>

        {/* Direct WhatsApp Assistance */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Need help accessing your orders?{" "}
          <a
            href={`https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
              "Hi Hatkhola Bazar, I need help logging into my account."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 hover:text-emerald-600 font-bold underline"
          >
            Chat with Support
          </a>
        </p>
      </main>
    </div>
  );
}
