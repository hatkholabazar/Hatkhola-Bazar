"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasToken(!!localStorage.getItem("hatkhola_admin_token"));
    }
  }, []);

  const adminEmail = (
    process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@hatkholabazar.com"
  )
    .toLowerCase()
    .trim();

  const isUserAdmin =
    (session?.user &&
      (session.user.role === "admin" ||
        (session.user as any).role === "admin" ||
        session.user.email?.toLowerCase().trim() === adminEmail)) ||
    hasToken === true;

  useEffect(() => {
    if (!isPending && hasToken !== null && !isUserAdmin) {
      router.push("/login?redirect=/admin");
    }
  }, [isPending, hasToken, isUserAdmin, router]);

  if (isPending || hasToken === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isUserAdmin) {
    return null;
  }

  return <>{children}</>;
}
