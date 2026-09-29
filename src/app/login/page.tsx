"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  ArrowRight,
  RefreshCw,
  KeyRound,
  Eye,
  CheckCircle2,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const USER_PORTRAIT_URL = "https://api.shahidur.dev/uploads/1790424783233-portrait.jpg";

export default function LoginPage() {
  const router = useRouter();
  const { login, adminToken, enterGuestMode, exitGuestMode, isGuest, isLoaded } = useAuth();

  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // If already authenticated with an admin session, redirect to dashboard
  useEffect(() => {
    if (isLoaded && adminToken) {
      router.push("/");
    }
  }, [adminToken, isLoaded, router]);

  // If entering /login while in guest mode, exit guest mode so the login form is accessible
  useEffect(() => {
    if (isLoaded && isGuest) {
      exitGuestMode();
    }
  }, [isLoaded, isGuest, exitGuestMode]);

  // Focus input automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const executeLogin = async (codeToSubmit: string) => {
    const cleanCode = codeToSubmit.trim().replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      setErrorMessage("Please enter a valid 6-digit TOTP code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await login(cleanCode);

      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 400);
      } else {
        setErrorMessage(
          res.message ||
            "Invalid or expired Google Authenticator code. Check your phone's clock or browse in Guest View."
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to authenticate";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentVal = inputRef.current?.value || otpCode;
    executeLogin(currentVal);
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(val);
    setErrorMessage("");

    // Auto submit upon typing 6 full digits
    if (val.length === 6) {
      executeLogin(val);
    }
  };

  const handleGuestEntry = () => {
    enterGuestMode();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#09090b] relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-rose-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Cyberpunk grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370a_1px,transparent_1px),linear-gradient(to_bottom,#1f29370a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative w-full max-w-md">
        {/* Glow border wrapper */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-zinc-700/50 via-zinc-800/20 to-zinc-900 shadow-2xl">
          <div className="rounded-2xl bg-zinc-950/90 backdrop-blur-2xl p-6 sm:p-8 border border-white/5 space-y-6">
            
            {/* Header / Avatar */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500" />
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-indigo-500/40 bg-zinc-900 shadow-xl flex items-center justify-center">
                  <Image
                    src={USER_PORTRAIT_URL}
                    alt="Shahidur Rahman"
                    width={64}
                    height={64}
                    className="object-cover h-full w-full"
                    priority
                    unoptimized
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 rounded-full border-2 border-zinc-950 text-white shadow-md">
                  <Lock className="h-3 w-3" />
                </div>
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                  <span>Portfolio Admin</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono font-medium">
                    v2.0
                  </span>
                </h1>
                <p className="text-xs text-zinc-400 mt-1">
                  Enter your 6-digit Google Authenticator code to unlock 60-minute session.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                    <span>TOTP Verification Code</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">6 digits</span>
                </label>

                <div className="relative">
                  <Input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={handleOtpChange}
                    maxLength={6}
                    disabled={isLoading || isSuccess}
                    className="h-12 text-center text-xl tracking-[0.5em] font-mono font-bold bg-zinc-900/80 border-zinc-700/80 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl transition-all"
                  />
                  {isLoading && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                    </div>
                  )}
                  {isSuccess && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5 animate-pulse" />
                    </div>
                  )}
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <div className="space-y-1 leading-tight">
                      <p className="font-semibold text-red-200">{errorMessage}</p>
                      <p className="text-[11px] text-zinc-400">
                        Make sure your device clock is accurate. Or use Guest View below to explore without credentials.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading || otpCode.length !== 6 || isSuccess}
                className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2 text-sm">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Verifying Credentials...
                  </span>
                ) : isSuccess ? (
                  <span className="flex items-center gap-2 text-sm text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Access Granted!
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <span>Unlock Admin Console</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-950 px-3 text-[11px] font-mono uppercase text-zinc-500 shrink-0">
                Or Continue As
              </span>
              <div className="border-t border-zinc-800 w-full" />
            </div>

            {/* Guest View Option (Read Only) */}
            <button
              type="button"
              onClick={handleGuestEntry}
              className="w-full group p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-105 transition-transform">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-white flex items-center gap-1.5">
                    <span>Guest View (Read-Only)</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                      Safe
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    View projects, info & stats without editing permissions
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Session Info Banner */}
            <div className="pt-2 border-t border-zinc-800/80">
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-3 flex items-start gap-2.5 text-[11px] text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-zinc-300 block">
                    60-Minute Session Authentication
                  </span>
                  <span className="text-zinc-400 leading-relaxed block">
                    Admin session token is ephemeral (3,600s). You can terminate it at any moment using the emergency killswitch in the header.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-zinc-500 mt-4">
          Google Authenticator TOTP • Shahidur Rahman Portfolio Admin
        </p>
      </div>
    </div>
  );
}
