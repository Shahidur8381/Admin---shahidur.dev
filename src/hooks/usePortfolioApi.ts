"use client";

import useSWR from "swr";
import { useAuth } from "@/context/AuthContext";
import { createApiClient } from "@/lib/api";
import { PortfolioData } from "@/types/portfolio";
import { toast } from "sonner";
import { useMemo, useCallback } from "react";

export function usePortfolioApi() {
  const { apiUrl, adminToken, isGuest, totpCode, destroySession, triggerTotpAlert } = useAuth();

  const handleUnauthorized = useCallback(() => {
    if (adminToken) {
      destroySession(true);
    } else {
      triggerTotpAlert();
    }
  }, [adminToken, destroySession, triggerTotpAlert]);

  const authToken = adminToken || totpCode || null;

  const api = useMemo(
    () => createApiClient(apiUrl, authToken, handleUnauthorized, isGuest),
    [apiUrl, authToken, handleUnauthorized, isGuest]
  );

  const fetcher = useCallback(async (url: string) => {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Fetch failed: ${res.status}`);
    }
    return res.json() as Promise<PortfolioData>;
  }, []);

  const {
    data: portfolioData,
    error,
    isLoading,
    mutate,
  } = useSWR<PortfolioData>(`${apiUrl}/portfolio`, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: true,
  });

  const sortedPortfolioData = useMemo(() => {
    if (!portfolioData) return portfolioData;
    const sortList = <T extends { id: number | string; sortOrder?: number; sort_order?: number }>(
      list?: T[]
    ) => {
      if (!list || !Array.isArray(list)) return [];
      return [...list].sort(
        (a, b) =>
          (a.sortOrder ?? a.sort_order ?? 0) - (b.sortOrder ?? b.sort_order ?? 0)
      );
    };

    return {
      ...portfolioData,
      navLinks: sortList(portfolioData.navLinks),
      education: sortList(portfolioData.education),
      experiences: sortList(portfolioData.experiences),
      projects: sortList(portfolioData.projects),
      whatIBuilt: sortList(portfolioData.whatIBuilt),
      testimonials: sortList(portfolioData.testimonials),
      socialLinks: sortList(portfolioData.socialLinks),
    };
  }, [portfolioData]);

  const toggleItemHomepage = useCallback(
    async <T extends { id: number | string; showOnHomepage?: boolean }>(
      endpointSlug: "projects" | "experiences" | "education" | "what-i-built" | "testimonials" | "nav-links" | "social-links",
      item: T
    ) => {
      if (isGuest) {
        toast.error("Guest View Only", {
          description: "Modifications are disabled in Guest Mode. Please log in as Admin with TOTP to change visibility.",
        });
        return;
      }

      const currentStatus = Boolean(item.showOnHomepage);
      const newStatus = !currentStatus;

      // Optimistic update in SWR cache
      await mutate(
        (current) => {
          if (!current) return current;
          const clone = { ...current };

          // Map endpointSlug to portfolio key
          let key: keyof PortfolioData | null = null;
          if (endpointSlug === "projects") key = "projects";
          else if (endpointSlug === "experiences") key = "experiences";
          else if (endpointSlug === "education") key = "education";
          else if (endpointSlug === "what-i-built") key = "whatIBuilt";
          else if (endpointSlug === "testimonials") key = "testimonials";
          else if (endpointSlug === "nav-links") key = "navLinks";
          else if (endpointSlug === "social-links") key = "socialLinks";

          if (key && Array.isArray(clone[key])) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (clone as any)[key] = (clone[key] as any[]).map((i) =>
              i.id === item.id ? { ...i, showOnHomepage: newStatus } : i
            );
          }
          return clone;
        },
        { revalidate: false }
      );

      try {
        await api.toggleHomepage(endpointSlug, item.id, newStatus, item);
        toast.success(
          newStatus ? "Visible on portfolio homepage" : "Hidden from portfolio homepage",
          {
            description: `Item #${item.id} visibility updated successfully.`,
          }
        );
        // Revalidate to ensure server sync
        mutate();
      } catch (err: unknown) {
        // Revert optimistic update
        mutate();
        const msg = err instanceof Error ? err.message : "Failed to toggle visibility";
        if (msg.includes("TOTP")) {
          triggerTotpAlert();
        } else {
          toast.error("Failed to update homepage status", {
            description: msg,
          });
        }
      }
    },
    [isGuest, mutate, api, triggerTotpAlert]
  );

  const reorderItems = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async <T extends { id: number | string; sortOrder?: number; [key: string]: any }>(
      endpointSlug:
        | "projects"
        | "experiences"
        | "education"
        | "what-i-built"
        | "testimonials"
        | "nav-links"
        | "social-links",
      reorderedList: T[]
    ) => {
      // 1. Assign sequential 1-based sortOrder
      const updatedList = reorderedList.map((item, index) => ({
        ...item,
        sortOrder: index + 1,
        ...(endpointSlug === "social-links" ? { sort_order: index + 1 } : {}),
      }));

      // Map endpointSlug to portfolio key
      let key: keyof PortfolioData | null = null;
      if (endpointSlug === "projects") key = "projects";
      else if (endpointSlug === "experiences") key = "experiences";
      else if (endpointSlug === "education") key = "education";
      else if (endpointSlug === "what-i-built") key = "whatIBuilt";
      else if (endpointSlug === "testimonials") key = "testimonials";
      else if (endpointSlug === "nav-links") key = "navLinks";
      else if (endpointSlug === "social-links") key = "socialLinks";

      // 2. Optimistic update in SWR cache
      await mutate(
        (current) => {
          if (!current || !key) return current;
          return {
            ...current,
            [key]: updatedList,
          };
        },
        { revalidate: false }
      );

      if (isGuest) {
        toast.info("Guest Mode Preview", {
          description: "Reordering previewed locally (saving to backend requires Admin login).",
        });
        return true;
      }

      // 3. Identify which items actually changed sortOrder from the previous state
      const previousItems = (portfolioData && key ? (portfolioData[key] as unknown as T[]) : []) || [];
      const changedItems = updatedList.filter((item) => {
        const prev = previousItems.find((p) => p.id === item.id);
        return !prev || (prev.sortOrder ?? 0) !== item.sortOrder;
      });

      if (changedItems.length === 0) return true;

      try {
        // Try batch reorder endpoint first
        let batchSucceeded = false;
        try {
          const orders = updatedList.map((i) => ({ id: i.id, sortOrder: i.sortOrder }));
          await api.reorder(endpointSlug, orders);
          batchSucceeded = true;
        } catch {
          batchSucceeded = false;
        }

        // If batch is not supported, update individual changed items in parallel
        if (!batchSucceeded) {
          await Promise.all(
            changedItems.map(async (item) => {
              if (endpointSlug === "nav-links") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateNavLink(item.id, item as any);
              } else if (endpointSlug === "education") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateEducation(item.id, item as any);
              } else if (endpointSlug === "projects") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateProject(item.id, item as any);
              } else if (endpointSlug === "experiences") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateExperience(item.id, item as any);
              } else if (endpointSlug === "what-i-built") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateWhatIBuilt(item.id, item as any);
              } else if (endpointSlug === "testimonials") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateTestimonial(item.id, item as any);
              } else if (endpointSlug === "social-links") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return api.updateSocialLink(item.id, item as any);
              }
            })
          );
        }

        toast.success("Order updated successfully", {
          description: `Updated sequence for ${changedItems.length} item${changedItems.length > 1 ? "s" : ""}.`,
        });
        mutate();
        return true;
      } catch (err: unknown) {
        mutate(); // Revert on failure
        const msg = err instanceof Error ? err.message : "Failed to update order";
        if (msg.includes("TOTP")) {
          triggerTotpAlert();
        } else {
          toast.error("Failed to update order", { description: msg });
        }
        return false;
      }
    },
    [isGuest, mutate, portfolioData, api, triggerTotpAlert]
  );

  return {
    api,
    portfolioData: sortedPortfolioData,
    isLoading,
    error,
    mutatePortfolio: mutate,
    toggleItemHomepage,
    reorderItems,
  };
}
