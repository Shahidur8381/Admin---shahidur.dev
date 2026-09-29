"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Flame, Clock, ShieldAlert, LogIn, AlertTriangle, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SessionControl() {
  const {
    adminToken,
    remainingSeconds,
    isSessionActive,
    isVerifying,
    destroySession,
    verifySession,
    isGuest,
    exitGuestMode,
  } = useAuth();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);

  const formatTime = (secs: number | null) => {
    if (secs === null || secs <= 0) return "00:00";
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const isLowTime = remainingSeconds !== null && remainingSeconds < 300; // < 5 minutes

  const handleConfirmDestroy = async () => {
    setIsTerminating(true);
    setConfirmOpen(false);
    try {
      // Give a brief moment for dramatic screen lockdown animation
      await new Promise((r) => setTimeout(r, 600));
      await destroySession(false);
    } finally {
      setIsTerminating(false);
    }
  };

  if (!adminToken) {
    if (isGuest) {
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="bg-amber-950/40 border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 gap-1.5 font-mono"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
            </span>
            <span>Guest View</span>
          </Badge>
          <Button
            size="sm"
            onClick={exitGuestMode}
            className="bg-indigo-600/90 hover:bg-indigo-500 text-white gap-1.5 h-8 px-3 text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Login as Admin</span>
          </Button>
        </div>
      );
    }

    return (
      <Link href="/login">
        <Button
          size="sm"
          className="bg-indigo-600/80 hover:bg-indigo-500 text-white gap-1.5 h-8 px-3 text-xs shadow-md shadow-indigo-600/20"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Admin Login</span>
        </Button>
      </Link>
    );
  }

  return (
    <>
      {/* Dramatic Screen Lockdown Overlay */}
      {isTerminating && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-red-600/30 rounded-full blur-2xl animate-ping" />
            <div className="relative p-5 rounded-full bg-red-950/80 border-2 border-red-500/80 shadow-[0_0_50px_rgba(239,68,68,0.8)] text-red-400">
              <Flame className="h-12 w-12 animate-pulse" />
            </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            💥 Terminating Session...
          </h2>
          <p className="text-red-300/80 text-sm max-w-sm font-mono">
            Purging administrative credentials & locking console access.
          </p>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Live Session Countdown Badge */}
        <div
          onClick={() => verifySession()}
          title="Click to sync remaining session with server (GET /api/admin/verify)"
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-all duration-300 cursor-pointer select-none",
            isLowTime
              ? "border-red-500/80 bg-red-950/50 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse"
              : "border-emerald-500/30 bg-emerald-950/20 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:border-emerald-500/60"
          )}
        >
          <span className="text-sm">⏱️</span>
          <div className="flex items-center gap-1 font-semibold">
            <span className="text-[11px] uppercase font-sans tracking-wide text-zinc-400 hidden sm:inline">
              Session:
            </span>
            <span
              className={cn(
                "tracking-wider text-xs font-mono",
                isLowTime ? "text-red-400 font-bold" : "text-emerald-300"
              )}
            >
              {formatTime(remainingSeconds)}
            </span>
          </div>
          {isVerifying && <RefreshCw className="h-3 w-3 animate-spin text-zinc-400 ml-0.5" />}
        </div>

        {/* Fancy "Destroy Session" (Emergency Killswitch) Button */}
        <button
          onClick={() => setConfirmOpen(true)}
          className={cn(
            "relative group flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer overflow-hidden select-none",
            "bg-gradient-to-r from-red-600 via-rose-600 to-red-700",
            "border border-red-400/60 hover:border-red-300",
            "text-white",
            "shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.8)]",
            "hover:scale-[1.03] active:scale-95",
            "focus:outline-none focus:ring-2 focus:ring-red-400/60 focus:ring-offset-2 focus:ring-offset-zinc-950"
          )}
          title="Emergency Session Killswitch"
        >
          {/* Subtle animated background scanline */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full duration-700 transition-transform" />

          <Flame className="h-4 w-4 text-amber-200 group-hover:scale-110 transition-transform animate-pulse" />
          <span className="font-mono tracking-tight hidden sm:inline">⚡ Destroy Session</span>
          <span className="font-mono tracking-tight sm:hidden">Kill</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md border-red-500/30 bg-zinc-950/95 backdrop-blur-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-red-400 text-lg flex items-center gap-2">
                  <span>Terminate Session immediately?</span>
                </DialogTitle>
                <DialogDescription className="mt-1 text-zinc-400">
                  This emergency killswitch will invalidate your token on the remote server and
                  lock your admin console immediately.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-2 space-y-3">
            <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" /> Security Protocol
              </p>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Endpoint: <code className="text-red-300">POST /api/admin/destroy-session</code>
                <br />
                All active administrative session cookies & storage tokens will be deleted.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={isTerminating}
            >
              Abort
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDestroy}
              disabled={isTerminating}
              className="bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
            >
              {isTerminating ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Flame className="h-4 w-4 mr-1.5" />
              )}
              {isTerminating ? "Terminating..." : "💥 Destroy Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
