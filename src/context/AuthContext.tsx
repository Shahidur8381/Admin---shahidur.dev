"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { createApiClient, ApiError } from "@/lib/api";

interface AuthContextType {
  adminToken: string | null;
  isGuest: boolean;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  totpCode: string;
  setTotpCode: (code: string) => void;
  apiUrl: string;
  setApiUrl: (url: string) => void;
  isSessionActive: boolean;
  isTotpValid: boolean;
  highlightTotp: boolean;
  isLoaded: boolean;
  remainingSeconds: number | null;
  isVerifying: boolean;
  login: (otpCode: string) => Promise<{ success: boolean; message?: string }>;
  destroySession: (silent?: boolean) => Promise<void>;
  verifySession: () => Promise<void>;
  triggerTotpAlert: (customMessage?: string) => void;
  resetTotpAlert: () => void;
  getAuthHeaders: () => Record<string, string>;
  testConnection: () => Promise<{ success: boolean; message: string }>;
}

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || "/api/backend";
const ADMIN_TOKEN_KEY = "admin_token";
const GUEST_STORAGE_KEY = "portfolio_admin_is_guest";
const TOTP_STORAGE_KEY = "portfolio_admin_totp";
const API_URL_STORAGE_KEY = "portfolio_admin_api_url";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [totpCode, setTotpState] = useState<string>("");
  const [apiUrl, setApiUrlState] = useState<string>(DEFAULT_API_URL);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [highlightTotp, setHighlightTotp] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const tickerRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpiredRef = useRef<boolean>(false);

  // Initialize from localStorage
  useEffect(() => {
    try {
      // Check query parameter token if present in URL
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const queryToken = urlParams.get("token");
        if (queryToken) {
          localStorage.setItem(ADMIN_TOKEN_KEY, queryToken);
          setAdminToken(queryToken);
        }
      }

      const storedToken = localStorage.getItem(ADMIN_TOKEN_KEY);
      if (storedToken) {
        setAdminToken(storedToken);
      } else {
        const storedGuest = localStorage.getItem(GUEST_STORAGE_KEY);
        if (storedGuest === "true") {
          setIsGuest(true);
        }
      }
      const storedTotp = localStorage.getItem(TOTP_STORAGE_KEY);
      if (storedTotp) {
        setTotpState(storedTotp);
      }
      const storedUrl = localStorage.getItem(API_URL_STORAGE_KEY);
      if (storedUrl && storedUrl !== "https://api.shahidur.dev/api") {
        setApiUrlState(storedUrl);
      } else {
        setApiUrlState(DEFAULT_API_URL);
      }
    } catch (e) {
      console.warn("Could not read localStorage for auth config:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const handleSessionExpired = useCallback(() => {
    if (hasExpiredRef.current) return;
    hasExpiredRef.current = true;

    try {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (e) {
      console.error(e);
    }

    setAdminToken(null);
    setRemainingSeconds(null);

    toast.error("Session Expired", {
      description: "Your 60-minute admin session has ended. Please log in again.",
      duration: 6000,
    });

    if (pathnameRef.current !== "/login") {
      router.push("/login");
    }

    setTimeout(() => {
      hasExpiredRef.current = false;
    }, 2000);
  }, [router]);

  // Synchronize with server /api/admin/verify
  const verifySession = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null;
    if (!token) {
      setRemainingSeconds(null);
      return;
    }

    setIsVerifying(true);
    try {
      const client = createApiClient(apiUrl, token);
      const res = await client.verifySession();
      if (typeof res?.remainingSeconds === "number") {
        setRemainingSeconds(res.remainingSeconds);
        hasExpiredRef.current = false;
      }
    } catch (err: unknown) {
      console.warn("Session verification warning:", err);
      // ONLY terminate session if server explicitly returned 401 Unauthorized
      const is401 =
        (err instanceof ApiError && err.status === 401) ||
        (typeof err === "object" && err !== null && "status" in err && (err as { status: number }).status === 401);

      if (is401) {
        handleSessionExpired();
      } else {
        // If 429 (Rate limit) or temporary network issue, keep the active session alive!
        // The local countdown timer will continue ticking down normally without logging the user out.
        console.warn("Preserving admin session despite temporary verification error (rate limit or network).");
      }
    } finally {
      setIsVerifying(false);
    }
  }, [apiUrl, handleSessionExpired]);

  const lastVerifiedTokenRef = useRef<string | null>(null);

  // When adminToken changes, verify once
  useEffect(() => {
    if (isLoaded && adminToken) {
      if (adminToken !== lastVerifiedTokenRef.current) {
        lastVerifiedTokenRef.current = adminToken;
        verifySession();
      }
    } else if (isLoaded && !adminToken) {
      lastVerifiedTokenRef.current = null;
      setRemainingSeconds(null);
    }
  }, [adminToken, isLoaded, verifySession]);

  // Background ticker: tick down remainingSeconds every 1 second
  useEffect(() => {
    if (tickerRef.current) {
      clearInterval(tickerRef.current);
    }

    if (remainingSeconds !== null && remainingSeconds > 0) {
      tickerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev === null) return null;
          if (prev <= 1) {
            handleSessionExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
      }
    };
  }, [remainingSeconds, handleSessionExpired]);

  // Periodically re-sync with server every 90 seconds to prevent clock drift
  useEffect(() => {
    if (!adminToken) return;

    const syncInterval = setInterval(() => {
      verifySession();
    }, 90000);

    return () => clearInterval(syncInterval);
  }, [adminToken, verifySession]);

  // Guest mode controls
  const enterGuestMode = useCallback(() => {
    try {
      localStorage.setItem(GUEST_STORAGE_KEY, "true");
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    } catch (e) {
      console.error(e);
    }
    setAdminToken(null);
    setRemainingSeconds(null);
    setIsGuest(true);
    toast.info("Guest Mode Active", {
      description: "You have view-only access. Modifications and edits are disabled.",
    });
    router.push("/");
  }, [router]);

  const exitGuestMode = useCallback(() => {
    try {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
    setIsGuest(false);
    router.push("/login");
  }, [router]);

  // Login method
  const login = useCallback(
    async (otpCode: string): Promise<{ success: boolean; message?: string }> => {
      const cleanCode = otpCode.trim().replace(/\D/g, "");

      // 1. Try standard POST /api/admin/login
      try {
        const client = createApiClient(apiUrl);
        const res = await client.login(cleanCode);

        if (res && res.token) {
          try {
            localStorage.setItem(ADMIN_TOKEN_KEY, res.token);
            localStorage.removeItem(GUEST_STORAGE_KEY);
          } catch (e) {
            console.error("Failed to store token:", e);
          }

          setIsGuest(false);
          setAdminToken(res.token);
          setRemainingSeconds(res.remainingSeconds ?? 3600);
          hasExpiredRef.current = false;

          toast.success("Authentication Successful!", {
            description: "60-minute admin session initiated.",
          });

          return { success: true };
        }
      } catch (err: unknown) {
        console.warn("POST /admin/login failed, attempting TOTP verification fallback...", err);

        // 2. Fallback: Check if the code is valid via Authorization: TOTP <code_here>
        try {
          const testRes = await fetch(`${apiUrl}/admin/verify`, {
            headers: {
              Authorization: `TOTP ${cleanCode}`,
            },
          });

          if (testRes.ok) {
            const testData = await testRes.json().catch(() => ({}));
            const sessionToken = testData.token || cleanCode;
            try {
              localStorage.setItem(ADMIN_TOKEN_KEY, sessionToken);
              localStorage.removeItem(GUEST_STORAGE_KEY);
            } catch (e) {
              console.error(e);
            }

            setIsGuest(false);
            setAdminToken(sessionToken);
            setRemainingSeconds(testData.remainingSeconds ?? 3600);
            hasExpiredRef.current = false;

            toast.success("Authentication Successful!", {
              description: "60-minute admin session verified via TOTP.",
            });

            return { success: true };
          }
        } catch (fallbackErr) {
          console.warn("Fallback TOTP check also failed:", fallbackErr);
        }

        const msg = err instanceof Error ? err.message : "Authentication failed";
        return { success: false, message: msg };
      }

      return { success: false, message: "Invalid response from server" };
    },
    [apiUrl]
  );

  // Fancy Destroy Session (Emergency Killswitch)
  const destroySession = useCallback(
    async (silent = false) => {
      const token = adminToken || (typeof window !== "undefined" ? localStorage.getItem(ADMIN_TOKEN_KEY) : null);

      if (token) {
        try {
          const client = createApiClient(apiUrl, token);
          await client.destroySession();
        } catch (e) {
          console.warn("Backend destroy session error:", e);
        }
      }

      // Purge local state
      try {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(GUEST_STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }

      setAdminToken(null);
      setIsGuest(false);
      setRemainingSeconds(null);

      if (!silent) {
        toast.error("💥 Session Destroyed. Access Revoked.", {
          description: "Admin token has been purged and session invalidated on the server.",
          duration: 5000,
        });
      }

      router.push("/login");
    },
    [adminToken, apiUrl, router]
  );

  const setTotpCode = useCallback((code: string) => {
    const cleaned = code.trim();
    setTotpState(cleaned);
    try {
      if (cleaned) {
        localStorage.setItem(TOTP_STORAGE_KEY, cleaned);
      } else {
        localStorage.removeItem(TOTP_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to persist TOTP code:", e);
    }
  }, []);

  const setApiUrl = useCallback((url: string) => {
    const cleaned = url.trim().replace(/\/+$/, "");
    setApiUrlState(cleaned);
    try {
      localStorage.setItem(API_URL_STORAGE_KEY, cleaned);
    } catch (e) {
      console.error("Failed to persist API URL:", e);
    }
  }, []);

  const triggerTotpAlert = useCallback((customMessage?: string) => {
    setHighlightTotp(true);
    const message = customMessage || "Session expired or invalid authorization. Please log in.";
    toast.error(message, {
      description: "Admin modifications require an active 60-minute session. Please log in as admin.",
      duration: 5000,
    });
  }, []);

  const resetTotpAlert = useCallback(() => {
    setHighlightTotp(false);
  }, []);

  const getAuthHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    } else if (totpCode) {
      headers["Authorization"] = `TOTP ${totpCode}`;
    }
    return headers;
  }, [adminToken, totpCode]);

  const testConnection = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${apiUrl}/portfolio`, {
        cache: "no-store",
      });
      if (res.ok) {
        return { success: true, message: "Backend is reachable and responding with 200 OK." };
      }
      return {
        success: false,
        message: `Backend returned status ${res.status}: ${res.statusText}`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Network error";
      return { success: false, message: `Could not connect to backend: ${errorMsg}` };
    }
  }, [apiUrl]);

  const isSessionActive = Boolean(adminToken && (remainingSeconds === null || remainingSeconds > 0));
  const isTotpValid = Boolean(adminToken || (totpCode && totpCode.trim().length === 6));

  return (
    <AuthContext.Provider
      value={{
        adminToken,
        isGuest,
        enterGuestMode,
        exitGuestMode,
        totpCode,
        setTotpCode,
        apiUrl,
        setApiUrl,
        isSessionActive,
        isTotpValid,
        highlightTotp,
        isLoaded,
        remainingSeconds,
        isVerifying,
        login,
        destroySession,
        verifySession,
        triggerTotpAlert,
        resetTotpAlert,
        getAuthHeaders,
        testConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
