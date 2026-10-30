"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSignInAlt,
  FaUserPlus,
  FaShieldAlt,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";
import { siteConfig } from "@/data/siteConfig";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const { business } = siteConfig;
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
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
      const isUserAdmin = session.user.role === "admin";
      const targetUrl = redirectParam || (isUserAdmin ? "/admin" : "/profile");
      router.replace(targetUrl);
    }
  }, [session, sessionPending, redirectParam, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe,
        callbackURL: redirectParam || "/profile",
      });

      if (error) {
        setErrorMsg(error.message || "Failed to sign in. Please check your credentials.");
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

        const targetUrl = redirectParam || (isUserAdmin ? "/admin" : "/profile");
        router.push(targetUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionPending && session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-amber-50/20 to-white text-slate-800 pb-20 pt-16 flex flex-col items-center justify-center space-y-3">
        <FaSpinner className="w-6 h-6 text-primary animate-spin" />
        <p className="text-xs text-slate-600 font-bold">Redirecting to your account...</p>
      </div>
    );
  }

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
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-orange-200/80 shadow-md p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-fade-in">
              <FaExclamationCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                />
                <FaEnvelope className="absolute right-3.5 top-3.5 text-slate-400 w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4" />
                  ) : (
                    <FaEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-extrabold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <FaSignInAlt className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Sign Up */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              Don’t have an account yet?{" "}
              <Link
                href="/sign-up"
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-orange-50/60 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
