"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaShieldAlt,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect directly to the target destination
  useEffect(() => {
    if (!sessionPending && session?.user) {
      router.replace(redirectUrl);
    }
  }, [session, sessionPending, redirectUrl, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
        callbackURL: redirectUrl,
      });

      if (error) {
        const safeError = "Incorrect email or password.";
        setErrorMsg(safeError);
        toast.error(safeError, { id: "signin-error" });
      } else {
        const isUserAdmin = data?.user?.role === "admin";

        if (isUserAdmin) {
          document.cookie =
            "hatkhola_admin_token=admin; path=/; max-age=604800; SameSite=Lax";
          try {
            localStorage.setItem("hatkhola_admin_token", "admin");
          } catch {
            // Ignore storage errors
          }
        }

        toast.success(`Welcome back, ${data?.user?.name || "Customer"}!`, {
          id: "signin-success",
        });
        const finalUrl =
          redirectUrl === "/profile" && isUserAdmin ? "/admin" : redirectUrl;
        router.push(finalUrl);
        router.refresh();
      }
    } catch (err: any) {
      const safeError = "Failed to sign in. Please verify your internet connection.";
      setErrorMsg(safeError);
      toast.error(safeError, { id: "signin-error" });
    } finally {
      setLoading(false);
    }
  };

  if (!sessionPending && session?.user) {
    return (
      <div className="bg-white rounded-3xl border border-orange-200/90 shadow-xl shadow-orange-500/5 p-8 flex flex-col items-center justify-center space-y-3">
        <FaSpinner className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-slate-600 font-bold">Redirecting to your orders...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-orange-200/90 shadow-xl shadow-orange-500/5 p-6 sm:p-8 space-y-5">
      {errorMsg && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-fade-in"
        >
          <FaExclamationCircle className="text-red-500 shrink-0 text-base" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        {/* Email Address */}
        <div>
          <label
            htmlFor="signin-email"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Email Address *
          </label>
          <div className="relative">
            <input
              id="signin-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50 focus:bg-white"
            />
            <FaEnvelope className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="signin-password"
              className="block text-xs font-extrabold uppercase tracking-wider text-slate-700"
            >
              Password *
            </label>
          </div>
          <div className="relative">
            <input
              id="signin-password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50 focus:bg-white"
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
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
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
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap shadow-md shadow-orange-500/25 transition cursor-pointer transform active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin shrink-0" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <FaSignInAlt className="w-4 h-4 shrink-0" />
              <span>Sign In to Account</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign Up */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          New to Hatkhola Bazar?{" "}
          <Link
            href={`/sign-up${redirectUrl !== "/profile" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="font-bold text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
          >
            <span>Create an account</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignInPage() {
  const { business } = siteConfig;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-amber-50/20 to-white text-slate-800 pb-20 pt-6 sm:pt-10">
      <main className="max-w-md mx-auto px-4 sm:px-6">
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
              Sign In
            </p>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Sign in to track orders, manage deliveries, and view purchase history
          </p>
        </div>

        <Suspense fallback={<div className="w-full h-64 bg-white rounded-3xl animate-pulse" />}>
          <SignInForm />
        </Suspense>

        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 mt-6">
          <FaShieldAlt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Your personal information is securely guarded</span>
        </div>
      </main>
    </div>
  );
}

