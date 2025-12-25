"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { useAppSelector } from "@/lib/redux/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useLazyGetProfileQuery } from "@/lib/redux/api/authApi";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setCredentials, clearCredentials } from "@/lib/redux/slices/authSlice";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [getProfile, { isLoading }] = useLazyGetProfileQuery();

  useEffect(() => {
    // If not authenticated in Redux state, fetch profile
    if (!isAuthenticated) {
      const fetchProfile = async () => {
        try {
          const { data } = await getProfile().unwrap();
          if (data) {
            dispatch(setCredentials({ user: data, token: "session" }));
          }
        } catch (error) {
          // If 401 Unauthorized, middleware should happen on navigation,
          // but we also force logout state here.
          dispatch(clearCredentials());
          router.push("/login");
        }
      };

      fetchProfile();
    } else {
      // Redundancy check: If user role doesn't match path, redirect
      // Middleware handles this partly, but generic /admin allows Manager to see component
      // until this runs.
      if (pathname.startsWith("/admin") && user?.role !== "ADMIN") {
        router.replace("/manager/tickets");
      }
    }
  }, [isAuthenticated, router, pathname, user, getProfile, dispatch]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If we have no user and not loading (fetch failed), render null or nothing until redirect
  if (!isAuthenticated && !isLoading) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/20">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
