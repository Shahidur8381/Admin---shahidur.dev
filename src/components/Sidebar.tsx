"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  User,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  MessageSquareQuote,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Compass,
  Eye,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const navItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badgeKey: null,
  },
  {
    name: "Personal Info",
    href: "/personal",
    icon: User,
    badgeKey: null,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: FolderGit2,
    badgeKey: "projects" as const,
  },
  {
    name: "Experiences",
    href: "/experiences",
    icon: Briefcase,
    badgeKey: "experiences" as const,
  },
  {
    name: "Education",
    href: "/education",
    icon: GraduationCap,
    badgeKey: "education" as const,
  },
  {
    name: "What I Built",
    href: "/what-i-built",
    icon: Sparkles,
    badgeKey: "whatIBuilt" as const,
  },
  {
    name: "Testimonials",
    href: "/testimonials",
    icon: MessageSquareQuote,
    badgeKey: "testimonials" as const,
  },
  {
    name: "Nav Links",
    href: "/nav-links",
    icon: Compass,
    badgeKey: "navLinks" as const,
  },
  {
    name: "Social Links",
    href: "/social-links",
    icon: Share2,
    badgeKey: "socialLinks" as const,
  },
];

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { portfolioData } = usePortfolioApi();
  const { adminToken, isGuest } = useAuth();

  const getBadgeCount = (key: string | null) => {
    if (!key || !portfolioData) return null;
    const items = portfolioData[key as keyof typeof portfolioData];
    if (Array.isArray(items)) {
      return items.length;
    }
    return null;
  };

  const content = (
    <div className="flex h-full flex-col justify-between py-5 px-4">
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-2 mb-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-all overflow-hidden border border-indigo-500/40 shrink-0">
              {portfolioData?.personal?.portrait ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={portfolioData.personal.portrait}
                  alt={portfolioData.personal.name || "Shahidur Rahman"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span className="font-mono font-bold text-white text-lg">SR</span>
              )}
              <div className="absolute -inset-0.5 rounded-xl bg-indigo-500/30 blur-sm -z-10 group-hover:bg-indigo-500/50 transition-all" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white tracking-tight text-sm">
                  Portfolio CMS
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">admin.shahidur.dev</p>
            </div>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            const count = getBadgeCount(item.badgeKey);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-indigo-500/15 via-indigo-500/10 to-transparent text-white border-l-2 border-indigo-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-indigo-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.name}</span>
                </div>

                {count !== null && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-mono font-medium transition-colors",
                      isActive
                        ? "bg-indigo-500/25 text-indigo-300"
                        : "bg-zinc-800/80 text-zinc-400 group-hover:bg-zinc-800 group-hover:text-zinc-300"
                    )}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Info */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <a
          href="https://shahidur.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:border-zinc-700 transition-all group"
        >
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Website
          </span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300" />
        </a>

        <div className="flex items-center gap-3 px-2 py-1">
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shadow overflow-hidden border-2 border-indigo-500/40 shrink-0">
            {portfolioData?.personal?.portrait ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={portfolioData.personal.portrait}
                alt={portfolioData.personal.name || "Shahidur Rahman"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              "SR"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-zinc-200 truncate">
              {portfolioData?.personal?.name || "Shahidur Rahman"}
            </p>
            {adminToken ? (
              <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400 inline" /> Admin Authenticated
              </p>
            ) : isGuest ? (
              <p className="text-[10px] text-amber-400 flex items-center gap-1">
                <Eye className="h-3 w-3 inline" /> Guest View (Read-Only)
              </p>
            ) : (
              <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                Unauthenticated
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-zinc-950/80 border-r border-zinc-800/80 backdrop-blur-xl">
        {content}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 bg-zinc-950 border-r border-zinc-800 p-0 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
}
