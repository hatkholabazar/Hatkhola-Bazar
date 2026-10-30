"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaShieldAlt,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/profile";
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in, redirect directly to the target destination
  useEffect(() => {
    if (!sessionPending && session?.user) {
      router.replace(redirectUrl);
    }
  }, [session, sessionPending, redirectUrl, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      const err = "Password must be at least 8 characters long.";
      setErrorMsg(err);
      toast.error(err, { id: "signup-err-len" });
      return;
    }

    if (password !== confirmPassword) {
      const err = "Passwords do not match.";
      setErrorMsg(err);
      toast.error(err, { id: "signup-err-match" });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
        callbackURL: redirectUrl,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("already") || error.status === 422) {
          const err = "This email already has an account. Please sign in.";
          setErrorMsg(err);
          toast.warning(err, { id: "signup-email-exists" });
        } else {
          setErrorMsg(error.message || "Failed to create account.");
          toast.error(error.message || "Failed to create account.", { id: "signup-err" });
        }
      } else {
        toast.success(`Account created. Welcome, ${name.trim()}!`, {
          id: "signup-success",
        });
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: any) {
      const safeError = "Failed to create account. Please try again.";
      setErrorMsg(safeError);
      toast.error(safeError, { id: "signup-err" });
    } finally {
      setLoading(false);
    }
  };

  if (!sessionPending && session?.user) {
    return (
      <div className="bg-white rounded-3xl border border-orange-200/90 shadow-xl shadow-orange-500/5 p-8 flex flex-col items-center justify-center space-y-3">
        <FaSpinner className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-slate-600 font-bold">Redirecting to your account...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-orange-200/90 shadow-xl shadow-orange-500/5 p-6 sm:p-8 space-y-6">
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

      <form onSubmit={handleSignUp} className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Full Name *
          </label>
          <div className="relative">
            <input
              id="signup-name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tanvir Ahmed"
              className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50 focus:bg-white"
            />
            <FaUser className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Email Address *
          </label>
          <div className="relative">
            <input
              id="signup-email"
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
          <label
            htmlFor="signup-password"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Password (min 8 chars) *
          </label>
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter at least 8 characters"
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

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="signup-confirm-password"
            className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            Confirm Password *
          </label>
          <div className="relative">
            <input
              id="signup-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50 focus:bg-white"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition cursor-pointer"
            >
              {showConfirmPassword ? (
                <FaEyeSlash className="w-4 h-4" />
              ) : (
                <FaEye className="w-4 h-4" />
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="text-[11px] text-rose-600 mt-1 font-semibold">
              Passwords do not match.
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider whitespace-nowrap shadow-md shadow-orange-500/25 transition cursor-pointer transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          {loading ? (
            <>
              <FaSpinner className="w-4 h-4 animate-spin shrink-0" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <FaUserPlus className="w-4 h-4 shrink-0" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      {/* Switch to Sign In */}
      <div className="pt-4 border-t border-slate-100 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={`/sign-in${redirectUrl !== "/profile" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
            className="font-bold text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
          >
            <span>Sign in</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignUpPage() {
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
              Create Account
            </p>
          </Link>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Enjoy swift reordering, doorstep parcel tracking, and authentic seasonal batches
          </p>
        </div>

        <Suspense fallback={<div className="w-full h-64 bg-white rounded-3xl animate-pulse" />}>
          <SignUpForm />
        </Suspense>

        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 mt-6">
          <FaShieldAlt className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Your personal information is securely guarded</span>
        </div>
      </main>
    </div>
  );
}

