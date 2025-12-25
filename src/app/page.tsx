"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/redux/hooks";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Unauthenticated -> /login
    // Authenticated -> Middleware redirects /login -> /admin/triage
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse space-y-4 text-center">
        <h1 className="text-2xl font-bold">Redirecting...</h1>
        <div className="w-8 h-8 bg-primary rounded-full mx-auto" />
      </div>
    </div>
  );
}
