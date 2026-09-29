"use client";

import React from "react";
import { Menu, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionControl } from "@/components/SessionControl";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { navItems } from "@/components/Sidebar";

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { isLoading, mutatePortfolio, portfolioData } = usePortfolioApi();

  const currentItem = navItems.find((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800/80 bg-zinc-950/75 px-4 md:px-8 backdrop-blur-xl transition-all">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMobileMenu}
          className="md:hidden text-zinc-400 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div>
          <h1 className="text-sm md:text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <span>{currentItem ? currentItem.name : "Portfolio Admin"}</span>
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Connected
            </span>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-500 font-mono text-[10px] hidden sm:inline">
              api.shahidur.dev
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <SessionControl />

        <Button
          variant="outline"
          size="icon"
          onClick={() => mutatePortfolio()}
          disabled={isLoading}
          title="Refresh Data from Server"
          className="h-8 w-8 text-zinc-400 hover:text-white"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
        </Button>

        {portfolioData?.personal?.portrait ? (
          <Link href="/personal" title="Personal Profile" className="hidden sm:block">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-indigo-500/40 bg-zinc-900 shadow hover:border-indigo-400 transition-all hover:scale-105 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={portfolioData.personal.portrait}
                alt={portfolioData.personal.name || "User"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </Link>
        ) : null}
      </div>
    </header>
  );
}
