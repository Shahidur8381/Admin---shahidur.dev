"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Briefcase,
  GraduationCap,
  Sparkles,
  MessageSquareQuote,
  Compass,
  Share2,
  User,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Eye,
  EyeOff,
  Server,
  Activity,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { portfolioData, isLoading, toggleItemHomepage } = usePortfolioApi();
  const { isTotpValid, apiUrl, isGuest, adminToken, remainingSeconds, exitGuestMode } = useAuth();
  const [filterModule, setFilterModule] = useState<string>("all");

  const projects = portfolioData?.projects || [];
  const experiences = portfolioData?.experiences || [];
  const education = portfolioData?.education || [];
  const whatIBuilt = portfolioData?.whatIBuilt || [];
  const testimonials = portfolioData?.testimonials || [];
  const navLinks = portfolioData?.navLinks || [];

  const totalHomepageItems =
    projects.filter((p) => p.showOnHomepage).length +
    experiences.filter((e) => e.showOnHomepage).length +
    education.filter((ed) => ed.showOnHomepage).length +
    whatIBuilt.filter((w) => w.showOnHomepage).length +
    testimonials.filter((t) => t.showOnHomepage).length;

  const stats = [
    {
      title: "Projects",
      count: projects.length,
      active: projects.filter((p) => p.showOnHomepage).length,
      href: "/projects",
      icon: FolderGit2,
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-500/30",
      iconColor: "text-blue-400",
    },
    {
      title: "Experiences",
      count: experiences.length,
      active: experiences.filter((e) => e.showOnHomepage).length,
      href: "/experiences",
      icon: Briefcase,
      color: "from-emerald-500/20 to-teal-500/20",
      borderColor: "border-emerald-500/30",
      iconColor: "text-emerald-400",
    },
    {
      title: "Education",
      count: education.length,
      active: education.filter((ed) => ed.showOnHomepage).length,
      href: "/education",
      icon: GraduationCap,
      color: "from-amber-500/20 to-orange-500/20",
      borderColor: "border-amber-500/30",
      iconColor: "text-amber-400",
    },
    {
      title: "What I Built",
      count: whatIBuilt.length,
      active: whatIBuilt.filter((w) => w.showOnHomepage).length,
      href: "/what-i-built",
      icon: Sparkles,
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-400",
    },
    {
      title: "Testimonials",
      count: testimonials.length,
      active: testimonials.filter((t) => t.showOnHomepage).length,
      href: "/testimonials",
      icon: MessageSquareQuote,
      color: "from-rose-500/20 to-red-500/20",
      borderColor: "border-rose-500/30",
      iconColor: "text-rose-400",
    },
    {
      title: "Navigation Links",
      count: navLinks.length,
      active: navLinks.length,
      href: "/nav-links",
      icon: Compass,
      color: "from-cyan-500/20 to-sky-500/20",
      borderColor: "border-cyan-500/30",
      iconColor: "text-cyan-400",
    },
    {
      title: "Social Links",
      count: portfolioData?.socialLinks?.length ?? 0,
      active: portfolioData?.socialLinks?.filter((s) => s.isActive !== false).length ?? 0,
      href: "/social-links",
      icon: Share2,
      color: "from-pink-500/20 to-rose-500/20",
      borderColor: "border-pink-500/30",
      iconColor: "text-pink-400",
    },
  ];

  // Combine items for quick homepage overview
  const allHomepageItems = [
    ...projects.map((p) => ({
      id: p.id,
      title: p.name,
      subtitle: "Project",
      type: "projects" as const,
      showOnHomepage: p.showOnHomepage,
      raw: p,
    })),
    ...experiences.map((e) => ({
      id: e.id,
      title: `${e.title} @ ${e.companyName}`,
      subtitle: "Experience",
      type: "experiences" as const,
      showOnHomepage: e.showOnHomepage,
      raw: e,
    })),
    ...whatIBuilt.map((w) => ({
      id: w.id,
      title: `${w.number}. ${w.title}`,
      subtitle: "What I Built",
      type: "what-i-built" as const,
      showOnHomepage: w.showOnHomepage,
      raw: w,
    })),
    ...education.map((ed) => ({
      id: ed.id,
      title: `${ed.title} (${ed.institution})`,
      subtitle: "Education",
      type: "education" as const,
      showOnHomepage: ed.showOnHomepage,
      raw: ed,
    })),
    ...testimonials.map((t) => ({
      id: t.id,
      title: `${t.name} (${t.company})`,
      subtitle: "Testimonial",
      type: "testimonials" as const,
      showOnHomepage: t.showOnHomepage,
      raw: t,
    })),
  ];

  const filteredItems =
    filterModule === "all"
      ? allHomepageItems
      : allHomepageItems.filter((item) => item.type === filterModule);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-950 p-6 md:p-8 backdrop-blur-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {portfolioData?.personal?.portrait ? (
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-indigo-500/40 shadow-xl shadow-indigo-500/10 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portfolioData.personal.portrait}
                  alt={portfolioData.personal.name || "Shahidur Rahman"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            ) : null}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="purple" className="font-mono text-[10px]">
                  PORTFOLIO CMS v2.0
                </Badge>
                {adminToken ? (
                  <Badge variant="success" className="gap-1 text-[10px]">
                    <ShieldCheck className="h-3 w-3" /> Admin Session Active
                  </Badge>
                ) : isGuest ? (
                  <button
                    type="button"
                    onClick={exitGuestMode}
                    className="cursor-pointer"
                    title="Click to log in as Admin"
                  >
                    <Badge variant="warning" className="gap-1 text-[10px] hover:bg-amber-950/80 transition-colors">
                      <Eye className="h-3 w-3" /> Guest View (Click to Login)
                    </Badge>
                  </button>
                ) : (
                  <Link href="/login">
                    <Badge variant="secondary" className="gap-1 text-[10px] cursor-pointer hover:bg-zinc-800">
                      <ShieldAlert className="h-3 w-3" /> Log In
                    </Badge>
                  </Link>
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Welcome back, {portfolioData?.personal?.name || "Shahidur"}
              </h2>
              <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Manage your projects, career timeline, testimonials, and live homepage visibility
                with instantaneous Google Authenticator (TOTP) secured updates.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/personal">
              <Button variant="outline" size="sm" className="gap-2">
                <User className="h-4 w-4 text-indigo-400" />
                Personal Bio
              </Button>
            </Link>
            <Link href="/projects">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Manage Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href} className="group">
              <div
                className={`relative overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-md transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-800/40 hover:shadow-xl group-hover:translate-y-[-2px]`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {stat.title}
                  </span>
                  <div className={`p-2 rounded-lg bg-zinc-800/80 border border-zinc-700/50 ${stat.iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-white">
                      {isLoading ? "..." : stat.count}
                    </span>
                    <span className="text-xs text-zinc-500">items</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Eye className="h-3 w-3" />
                    <span>{isLoading ? "..." : stat.active} active</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors">
                  <span>Manage {stat.title}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Critical Feature: Homepage Toggle Master Hub */}
      <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" />
                Homepage Visibility Master Control
              </CardTitle>
              <Badge variant="purple" className="text-[10px]">
                {totalHomepageItems} Visible on Site
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Toggle any item ON or OFF to immediately control what visitors see on your live portfolio.
            </CardDescription>
          </div>

          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "All Items" },
              { id: "projects", label: "Projects" },
              { id: "experiences", label: "Experiences" },
              { id: "what-i-built", label: "What I Built" },
              { id: "education", label: "Education" },
              { id: "testimonials", label: "Testimonials" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterModule(tab.id)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  filterModule === tab.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y divide-zinc-800/60">
            {isLoading ? (
              <div className="p-12 text-center text-sm text-zinc-500">
                Loading portfolio items...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-12 text-center text-sm text-zinc-500">
                No items found for this category.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between p-4 px-6 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-4">
                    <div
                      className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                        item.showOnHomepage ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-700"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="capitalize">{item.subtitle}</span>
                        <span>•</span>
                        <span>ID #{item.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        item.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {item.showOnHomepage ? "Visible on Homepage" : "Hidden"}
                    </span>

                    <Switch
                      checked={Boolean(item.showOnHomepage)}
                      disabled={isGuest}
                      onCheckedChange={() =>
                        toggleItemHomepage(item.type, item.raw)
                      }
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Backend & Security Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-400" />
              API Server Status
            </CardTitle>
            <CardDescription>Target backend endpoints for portfolio data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Endpoint:</span>
              <code className="text-indigo-300 font-mono">{apiUrl}</code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Connection State:</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Live 200 OK
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Security Protocol
            </CardTitle>
            <CardDescription>Session Token & TOTP Authorization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Authorization:</span>
              <code className="text-zinc-300 font-mono">
                {adminToken ? "Authorization: Bearer <token>" : "Authorization: Bearer (Required)"}
              </code>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs">
              <span className="text-zinc-400">Current Session:</span>
              {adminToken ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Active ({Math.floor((remainingSeconds || 0) / 60)}m left)
                </span>
              ) : isGuest ? (
                <span className="text-amber-400 font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Guest View (Read-Only)
                </span>
              ) : (
                <span className="text-zinc-400 font-medium flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" /> Log in via Admin Login
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
