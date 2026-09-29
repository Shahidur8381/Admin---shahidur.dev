"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";
import { Eye, KeyRound } from "lucide-react";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { adminToken, isGuest, isLoaded, exitGuestMode } = useAuth();

  const isLoginPage = pathname === "/login";
  const isAuthorized = Boolean(adminToken || isGuest);

  // Route guard: if unauthenticated and not on login page, redirect to /login
  useEffect(() => {
    if (!isLoaded) return;
    if (!isLoginPage && !isAuthorized) {
      router.push("/login");
    }
  }, [isLoaded, isAuthorized, isLoginPage, router]);

  // If on login page, render full screen without sidebar and header
  if (isLoginPage) {
    return <main className="flex-1 w-full min-h-screen">{children}</main>;
  }

  // If not yet loaded or not authenticated, render loading screen until redirect takes effect
  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono tracking-wider">Verifying session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="md:pl-64 flex flex-col flex-1 min-h-screen transition-all">
        {/* Guest View Banner */}
        {isGuest && (
          <div className="bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-yellow-950/70 border-b border-amber-500/30 px-4 py-2 text-xs flex items-center justify-between text-amber-200 shadow-md">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <strong className="font-semibold text-amber-300">Guest View Active:</strong> You are exploring in read-only mode. All modifications, toggles, and mutations are locked.
              </span>
            </div>
            <button
              type="button"
              onClick={exitGuestMode}
              className="flex items-center gap-1.5 font-semibold text-xs text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 rounded-lg transition-colors shrink-0 ml-3 cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Login as Admin</span>
            </button>
          </div>
        )}

        <Header onOpenMobileMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
      <Toaster
        position="bottom-right"
        theme="dark"
        toastOptions={{
          style: {
            background: "#121217",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fafafa",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)",
          },
        }}
      />
    </AuthProvider>
  );
}
