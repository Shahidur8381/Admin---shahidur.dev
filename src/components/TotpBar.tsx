"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { KeyRound, ShieldCheck, ShieldAlert, Check, RefreshCw, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function TotpBar() {
  const {
    totpCode,
    setTotpCode,
    apiUrl,
    setApiUrl,
    isTotpValid,
    highlightTotp,
    resetTotpAlert,
  } = useAuth();

  const [inputVal, setInputVal] = useState(totpCode);
  const [isTesting, setIsTesting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  useEffect(() => {
    setInputVal(totpCode);
  }, [totpCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setInputVal(val);
    setTotpCode(val);
    if (val.length === 6) {
      resetTotpAlert();
    }
  };

  const handleTestTotp = async () => {
    if (!totpCode || totpCode.length !== 6) {
      toast.warning("Please enter a 6-digit TOTP code first.");
      return;
    }

    setIsTesting(true);
    try {
      // Test using a PUT request with the current TOTP to /admin/personal with existing or empty check
      const res = await fetch(`${apiUrl}/admin/personal`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `TOTP ${totpCode}`,
        },
        body: JSON.stringify({}),
      });

      if (res.status === 401) {
        toast.error("Invalid or Expired TOTP Code. Please update it.", {
          description: "The backend rejected this 6-digit code.",
        });
      } else if (res.ok || res.status === 400 || res.status === 422) {
        // Status 200, or 400 validation error (which means TOTP passed auth check!)
        toast.success("TOTP Authenticated Successfully!", {
          description: "Your TOTP code is valid and active for all admin CRUD operations.",
        });
        resetTotpAlert();
      } else {
        toast.info(`Backend responded with status ${res.status}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      toast.error("Connection error while validating TOTP", {
        description: msg,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveSettings = () => {
    if (!tempUrl) return;
    setApiUrl(tempUrl);
    setSettingsOpen(false);
    toast.success("API Endpoint configuration updated");
  };

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300",
          highlightTotp
            ? "border-red-500/80 bg-red-950/30 glow-red"
            : isTotpValid
            ? "border-emerald-500/30 bg-emerald-950/20"
            : "border-zinc-800 bg-zinc-900/60"
        )}
      >
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "p-1.5 rounded-lg transition-colors",
              highlightTotp
                ? "bg-red-500/20 text-red-400"
                : isTotpValid
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-zinc-400"
            )}
            title="Google Authenticator TOTP"
          >
            <KeyRound className="h-4 w-4" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 leading-none">
              TOTP Auth
            </span>
            <span className="text-[10px] text-zinc-500 leading-tight">
              {isTotpValid ? "Key Armed" : "Enter 6 digits"}
            </span>
          </div>
        </div>

        <div className="relative">
          <Input
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            value={inputVal}
            onChange={handleChange}
            maxLength={6}
            className={cn(
              "w-28 sm:w-32 h-8 text-center font-mono tracking-widest text-sm font-semibold transition-all duration-200",
              highlightTotp
                ? "border-red-500 bg-red-950/40 text-red-200 focus-visible:ring-red-500"
                : isTotpValid
                ? "border-emerald-500/50 bg-emerald-950/30 text-emerald-200 focus-visible:ring-emerald-500"
                : "border-zinc-700 bg-zinc-900 text-zinc-200"
            )}
          />
        </div>

        <div className="flex items-center gap-1">
          {isTotpValid ? (
            <Badge variant="success" className="h-6 gap-1 px-2 hidden md:inline-flex">
              <ShieldCheck className="h-3 w-3" />
              Ready
            </Badge>
          ) : (
            <Badge variant="warning" className="h-6 gap-1 px-2 hidden md:inline-flex">
              <ShieldAlert className="h-3 w-3" />
              Required
            </Badge>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestTotp}
            disabled={isTesting || !totpCode}
            title="Verify TOTP code with backend"
            className="h-8 px-2 text-xs text-zinc-300 hover:text-white"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 mr-1", isTesting && "animate-spin")} />
            <span className="hidden lg:inline">Verify</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setTempUrl(apiUrl);
              setSettingsOpen(true);
            }}
            title="API Endpoint Settings"
            className="h-8 w-8 text-zinc-400 hover:text-white"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Backend API Configuration</DialogTitle>
            <DialogDescription>
              Configure the REST backend URL that this admin panel connects to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1.5">
                API Base URL
              </label>
              <Input
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="/api/backend"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Default: <code className="text-zinc-400">/api/backend</code> (Proxies to api.shahidur.dev without CORS issues)
              </p>
            </div>

            <div className="rounded-lg bg-zinc-900/80 p-3 border border-zinc-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-300 font-medium">
                <span>Current Mode:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Remote (Next.js Proxy)
                </span>
              </div>
              <p className="text-zinc-500 text-[11px]">
                Admin requests are authenticated by Google Authenticator TOTP via the{" "}
                <code className="text-zinc-300">Authorization: TOTP &lt;code&gt;</code> header.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTempUrl("/api/backend");
              }}
            >
              Reset to Default
            </Button>
            <Button size="sm" onClick={handleSaveSettings}>
              <Check className="h-4 w-4 mr-1" /> Save Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
