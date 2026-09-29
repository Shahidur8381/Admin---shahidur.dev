"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { SocialLink } from "@/types/portfolio";
import {
  Share2,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowUpDown,
  Search,
  Check,
  ShieldAlert,
  GripVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useDragReorder } from "@/hooks/useDragReorder";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { SocialPlatformIcon } from "@/components/SocialPlatformIcon";
import { toast } from "sonner";

// Preset platforms with default metadata for easy selection
export const PLATFORM_PRESETS = [
  { name: "GitHub", icon: "github", placeholder: "https://github.com/username", contact: true, footer: true },
  { name: "LinkedIn", icon: "linkedin", placeholder: "https://linkedin.com/in/username", contact: true, footer: true },
  { name: "WhatsApp", icon: "whatsapp", placeholder: "https://wa.me/1234567890", contact: true, footer: true },
  { name: "Telegram", icon: "telegram", placeholder: "https://t.me/username", contact: true, footer: true },
  { name: "LeetCode", icon: "leetcode", placeholder: "https://leetcode.com/u/username", contact: false, footer: true },
  { name: "Codeforces", icon: "codeforces", placeholder: "https://codeforces.com/profile/username", contact: false, footer: true },
  { name: "X / Twitter", icon: "x", placeholder: "https://x.com/username", contact: false, footer: true },
  { name: "Facebook", icon: "facebook", placeholder: "https://facebook.com/username", contact: false, footer: true },
  { name: "Instagram", icon: "instagram", placeholder: "https://instagram.com/username", contact: false, footer: true },
  { name: "Discord", icon: "discord", placeholder: "https://discord.gg/inviteCode", contact: false, footer: true },
  { name: "YouTube", icon: "youtube", placeholder: "https://youtube.com/@channel", contact: false, footer: true },
  { name: "Email", icon: "mail", placeholder: "mailto:hello@example.com", contact: true, footer: true },
  { name: "Website", icon: "globe", placeholder: "https://example.com", contact: true, footer: true },
  { name: "Other / Custom", icon: "globe", placeholder: "https://...", contact: true, footer: true },
];

// Discovered hardcoded links from the portfolio frontend
export const DISCOVERED_PORTFOLIO_LINKS: Omit<SocialLink, "id">[] = [
  {
    platform: "GitHub",
    label: "GitHub",
    url: "https://github.com/shahidur8381",
    icon: "github",
    showInContact: true,
    showInFooter: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    platform: "LinkedIn",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/shahidur8381",
    icon: "linkedin",
    showInContact: true,
    showInFooter: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    platform: "Telegram",
    label: "Telegram",
    url: "https://t.me/shahidur8381",
    icon: "telegram",
    showInContact: true,
    showInFooter: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    platform: "WhatsApp",
    label: "WhatsApp",
    url: "https://wa.me/shahidur8381",
    icon: "whatsapp",
    showInContact: true,
    showInFooter: true,
    isActive: true,
    sortOrder: 4,
  },
];

export default function SocialLinksPage() {
  const { api, mutatePortfolio, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert, isGuest } = useAuth();

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Search & filter
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // Create / Edit modal state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SocialLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formPlatform, setFormPlatform] = useState("GitHub");
  const [formCustomPlatform, setFormCustomPlatform] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formIcon, setFormIcon] = useState("github");
  const [formShowInContact, setFormShowInContact] = useState(true);
  const [formShowInFooter, setFormShowInFooter] = useState(true);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SocialLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Seeding state
  const [isSeeding, setIsSeeding] = useState(false);

  // Fetch social links from API
  const fetchSocialLinks = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getSocialLinks();
      const normalized = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item.id,
            platform: item.platform || "Other",
            label: item.label || item.platform || "Link",
            url: item.url || "",
            icon: item.icon || (item.platform || "").toLowerCase(),
            showInContact: item.showInContact ?? item.show_in_contact ?? true,
            showInFooter: item.showInFooter ?? item.show_in_footer ?? true,
            isActive: item.isActive ?? item.is_active ?? true,
            sortOrder: item.sortOrder ?? item.sort_order ?? 0,
          }))
        : [];
      // Sort by sortOrder ascending
      normalized.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      setSocialLinks(normalized);
    } catch (err: unknown) {
      console.warn("Failed to fetch social links from /api/admin/social-links:", err);
      const msg = err instanceof Error ? err.message : "Failed to load social links";
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchSocialLinks();
  }, [fetchSocialLinks]);

  // Handle platform preset change
  const handlePlatformChange = (presetName: string) => {
    setFormPlatform(presetName);
    const preset = PLATFORM_PRESETS.find((p) => p.name === presetName);

    if (preset) {
      if (presetName !== "Other / Custom") {
        setFormLabel(preset.name);
        setFormIcon(preset.icon);
        if (!formUrl || PLATFORM_PRESETS.some((p) => p.placeholder === formUrl)) {
          setFormUrl("");
        }
        setFormShowInContact(preset.contact);
        setFormShowInFooter(preset.footer);
      } else {
        setFormCustomPlatform("");
        setFormLabel("");
        setFormIcon("globe");
      }
    }
  };

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormPlatform("GitHub");
    setFormCustomPlatform("");
    setFormLabel("GitHub");
    setFormUrl("");
    setFormIcon("github");
    setFormShowInContact(true);
    setFormShowInFooter(true);
    setFormIsActive(true);
    setFormSortOrder(socialLinks.length + 1);
    setDialogOpen(true);
  };

  const openEditDialog = (item: SocialLink) => {
    setEditingItem(item);
    const matchingPreset = PLATFORM_PRESETS.find(
      (p) => p.name.toLowerCase() === item.platform.toLowerCase()
    );

    if (matchingPreset) {
      setFormPlatform(matchingPreset.name);
      setFormCustomPlatform("");
    } else {
      setFormPlatform("Other / Custom");
      setFormCustomPlatform(item.platform);
    }

    setFormLabel(item.label);
    setFormUrl(item.url);
    setFormIcon(item.icon || item.platform.toLowerCase());
    setFormShowInContact(Boolean(item.showInContact));
    setFormShowInFooter(Boolean(item.showInFooter));
    setFormIsActive(Boolean(item.isActive));
    setFormSortOrder(item.sortOrder ?? 0);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: SocialLink) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  // Form submit (create or update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Modifications are disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    const finalPlatform =
      formPlatform === "Other / Custom"
        ? formCustomPlatform.trim() || "Custom"
        : formPlatform.trim();

    const finalLabel = formLabel.trim() || finalPlatform;
    const finalUrl = formUrl.trim();

    if (!finalUrl) {
      toast.error("URL is required");
      return;
    }

    // Basic URL validation
    const isValidUrl =
      finalUrl.startsWith("http://") ||
      finalUrl.startsWith("https://") ||
      finalUrl.startsWith("mailto:") ||
      finalUrl.startsWith("tel:") ||
      finalUrl.startsWith("/");

    if (!isValidUrl) {
      toast.error("Invalid URL format", {
        description: "URL must begin with https://, http://, mailto:, or tel:",
      });
      return;
    }

    const payload: Omit<SocialLink, "id"> = {
      platform: finalPlatform,
      label: finalLabel,
      url: finalUrl,
      icon: formIcon.trim().toLowerCase() || finalPlatform.toLowerCase(),
      showInContact: formShowInContact,
      showInFooter: formShowInFooter,
      isActive: formIsActive,
      sortOrder: Number(formSortOrder) || 0,
    };

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.updateSocialLink(editingItem.id, payload);
        toast.success(`Social Link "${finalLabel}" updated successfully!`);
      } else {
        await api.createSocialLink(payload);
        toast.success(`Social Link "${finalLabel}" created successfully!`);
      }
      setDialogOpen(false);
      await fetchSocialLinks();
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save social link";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Operation Failed", { description: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Deleting is disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteSocialLink(deletingItem.id);
      toast.success(`Social link "${deletingItem.label}" deleted.`);
      setDeleteDialogOpen(false);
      await fetchSocialLinks();
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete social link";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Delete Failed", { description: msg });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Instant toggle for Contact, Footer, or Active state
  const handleQuickToggle = async (
    item: SocialLink,
    field: "showInContact" | "showInFooter" | "isActive"
  ) => {
    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Modifications are disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    const nextValue = !item[field];

    // Optimistic local state update
    setSocialLinks((prev) =>
      prev.map((l) => (l.id === item.id ? { ...l, [field]: nextValue } : l))
    );

    try {
      await api.updateSocialLink(item.id, { [field]: nextValue });
      const fieldLabels = {
        showInContact: "Contact Box visibility",
        showInFooter: "Footer visibility",
        isActive: "Active status",
      };
      toast.success(`${item.label} ${fieldLabels[field]} updated!`);
      mutatePortfolio();
    } catch (err: unknown) {
      // Revert optimistic update on failure
      setSocialLinks((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, [field]: item[field] } : l))
      );
      const msg = err instanceof Error ? err.message : "Failed to toggle setting";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Update Failed", { description: msg });
      }
    }
  };

  // Seed discovered portfolio links helper
  const handleSeedDefaults = async () => {
    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Seeding is disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    setIsSeeding(true);
    let successCount = 0;
    try {
      for (const link of DISCOVERED_PORTFOLIO_LINKS) {
        // Skip if already in list
        if (!socialLinks.some((l) => l.platform.toLowerCase() === link.platform.toLowerCase())) {
          await api.createSocialLink(link);
          successCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully imported ${successCount} discovered portfolio links!`);
        await fetchSocialLinks();
        mutatePortfolio();
      } else {
        toast.info("All discovered links already exist in your database.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to seed links";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Seeding Failed", { description: msg });
      }
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtered links
  const filteredLinks = useMemo(() => {
    return socialLinks.filter((link) => {
      const matchesSearch =
        link.platform.toLowerCase().includes(search.toLowerCase()) ||
        link.label.toLowerCase().includes(search.toLowerCase()) ||
        link.url.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterActive === "all"
          ? true
          : filterActive === "active"
          ? link.isActive
          : !link.isActive;

      return matchesSearch && matchesStatus;
    });
  }, [socialLinks, search, filterActive]);

  const isFilterActive = filterActive !== "all" || Boolean(search.trim());

  const { getItemProps, getHandleProps } = useDragReorder<SocialLink>({
    items: socialLinks,
    disabled: isFilterActive,
    onReorder: async (newItems) => {
      setSocialLinks(newItems);
      await reorderItems("social-links", newItems);
      await fetchSocialLinks();
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Share2 className="h-6 w-6 text-indigo-400" />
            Social & Contact Links Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage all external social channels, developer profiles, and contact endpoints across your portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSocialLinks}
            disabled={isLoading}
            className="gap-1.5 text-zinc-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-400" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
            <Plus className="h-4 w-4" />
            Add Social Link
          </Button>
        </div>
      </div>

      {/* Discovered Links Migration / Seed Banner */}
      {socialLinks.length === 0 && !isLoading && (
        <Card className="border-amber-500/30 bg-amber-950/20 backdrop-blur-xl">
          <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Found 4 Hardcoded Links in Portfolio Frontend</span>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                Your portfolio currently references <strong>GitHub, LinkedIn, Telegram, and WhatsApp</strong>.
                You can import them directly into your database with one click.
              </p>
            </div>
            <Button
              onClick={handleSeedDefaults}
              disabled={isSeeding}
              className="bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 shrink-0 text-xs gap-1.5"
            >
              {isSeeding ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              <span>Import Discovered Links</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Backend API Notice if endpoint is not responding */}
      {loadError && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-red-200">Backend Communication Notice</p>
            <p className="text-zinc-400">
              Could not retrieve records from <code className="text-red-300">GET /api/admin/social-links</code>: {loadError}.
              Ensure your backend database table and endpoint are deployed.
            </p>
          </div>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search platform, label, or URL..."
            className="pl-8 text-xs bg-zinc-900/60 border-zinc-800"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
          <span className="text-zinc-500 mr-1 font-mono text-[11px]">Filter:</span>
          {(["all", "active", "inactive"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterActive(mode)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all capitalize cursor-pointer ${
                filterActive === mode
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <CardHeader className="border-b border-zinc-800/80 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <span>Configured Social & Contact Endpoints</span>
                <Badge variant="purple" className="text-[10px] font-mono">
                  {filteredLinks.length} {filteredLinks.length === 1 ? "Link" : "Links"}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-0.5">
                Toggle visibility flags to display links in the Contact Box, Footer, or everywhere.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
                {isFilterActive ? "Clear filter to reorder" : "Drag rows to reorder"}
              </span>

              {socialLinks.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSeedDefaults}
                  disabled={isSeeding}
                  className="text-[11px] text-zinc-400 hover:text-white"
                  title="Seed any missing initial links (GitHub, LinkedIn, WhatsApp, Telegram)"
                >
                  <Sparkles className="h-3 w-3 mr-1 text-amber-400" /> Sync Defaults
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 text-center text-sm text-zinc-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading social links from backend...
            </div>
          ) : filteredLinks.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500 space-y-3">
              <p>No social links match the criteria.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={openCreateDialog}
                className="text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Create First Link
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10 text-center" title="Drag to reorder"></TableHead>
                    <TableHead className="w-12 text-center">Icon</TableHead>
                    <TableHead>Platform & Label</TableHead>
                    <TableHead>Destination URL</TableHead>
                    <TableHead className="w-28 text-center">Contact Box</TableHead>
                    <TableHead className="w-28 text-center">Footer</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="w-20 text-center">Order</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLinks.map((link, index) => {
                    const itemProps = getItemProps(index, true);
                    const handleProps = getHandleProps(index);
                    return (
                      <TableRow
                        key={link.id}
                        {...(!isFilterActive ? itemProps : {})}
                        className={`hover:bg-zinc-800/30 ${!isFilterActive ? itemProps.className : ""}`}
                      >
                        {/* Drag Handle */}
                        <TableCell className="w-10 text-center px-1">
                          {!isFilterActive ? (
                            <div {...handleProps}>
                              <GripVertical className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="text-zinc-600 p-1 flex justify-center" title="Clear filter to reorder">
                              <GripVertical className="h-4 w-4 opacity-25 cursor-not-allowed" />
                            </div>
                          )}
                        </TableCell>

                        {/* Platform Icon */}
                      <TableCell className="text-center">
                        <div className="h-8 w-8 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-indigo-400 mx-auto shadow-sm">
                          <SocialPlatformIcon
                            platform={link.platform}
                            icon={link.icon}
                            className="w-4 h-4"
                          />
                        </div>
                      </TableCell>

                      {/* Platform & Label */}
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                            <span>{link.label}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                              {link.platform}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-zinc-500">
                            icon: {link.icon || link.platform.toLowerCase()}
                          </span>
                        </div>
                      </TableCell>

                      {/* Destination URL with external link click */}
                      <TableCell>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/link inline-flex items-center gap-1 text-xs font-mono text-zinc-300 hover:text-indigo-300 transition-colors max-w-xs truncate"
                          title={link.url}
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0 text-zinc-500 group-hover/link:text-indigo-300" />
                        </a>
                      </TableCell>

                      {/* Contact Box Toggle */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={Boolean(link.showInContact)}
                            onCheckedChange={() => handleQuickToggle(link, "showInContact")}
                          />
                          <span
                            className={`text-[10px] font-medium font-mono ${
                              link.showInContact ? "text-emerald-400" : "text-zinc-500"
                            }`}
                          >
                            {link.showInContact ? "ON" : "OFF"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Footer Toggle */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={Boolean(link.showInFooter)}
                            onCheckedChange={() => handleQuickToggle(link, "showInFooter")}
                          />
                          <span
                            className={`text-[10px] font-medium font-mono ${
                              link.showInFooter ? "text-emerald-400" : "text-zinc-500"
                            }`}
                          >
                            {link.showInFooter ? "ON" : "OFF"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Active Status Toggle */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={Boolean(link.isActive)}
                            onCheckedChange={() => handleQuickToggle(link, "isActive")}
                          />
                          <span
                            className={`text-[10px] font-medium ${
                              link.isActive ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {link.isActive ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Sort Order */}
                      <TableCell className="text-center font-mono text-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 font-semibold text-zinc-300">
                          #{link.sortOrder ?? index + 1}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(link)}
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                            title="Edit Link"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => openDeleteDialog(link)}
                            className="h-8 w-8"
                            title="Delete Link"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-indigo-400" />
              <span>{editingItem ? "Edit Social Link" : "Add New Social Link"}</span>
            </DialogTitle>
            <DialogDescription>
              Configure destination URL, display label, platform type, and frontend visibility flags.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            {/* Platform Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Platform Preset *</span>
                <span className="text-[10px] text-zinc-500">Supports future platforms</span>
              </label>
              <select
                value={formPlatform}
                onChange={(e) => handlePlatformChange(e.target.value)}
                className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {PLATFORM_PRESETS.map((p) => (
                  <option key={p.name} value={p.name} className="bg-zinc-900 text-zinc-100">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Platform Input (if Other / Custom selected) */}
            {formPlatform === "Other / Custom" && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <label className="text-xs font-medium text-zinc-300">Custom Platform Name *</label>
                <Input
                  value={formCustomPlatform}
                  onChange={(e) => setFormCustomPlatform(e.target.value)}
                  placeholder="e.g. Threads, Medium, Mastodon, Kaggle"
                  required
                />
              </div>
            )}

            {/* Label & Icon Identifier */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Display Label *</label>
                <Input
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. GitHub or My LeetCode"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Icon Identifier</span>
                  <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono">
                    <span>preview:</span>
                    <SocialPlatformIcon icon={formIcon} className="w-3.5 h-3.5 inline" />
                  </div>
                </label>
                <Input
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value.toLowerCase())}
                  placeholder="e.g. github, linkedin, x, globe"
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Target URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Destination URL *</span>
                <span className="text-[10px] text-zinc-500 font-mono">https://...</span>
              </label>
              <Input
                type="text"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://github.com/Shahidur8381"
                required
                className="font-mono text-xs"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>Display Sort Order</span>
                <span className="text-[10px] text-zinc-500">Lower numbers appear first</span>
              </label>
              <Input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                placeholder="1"
                min={0}
              />
            </div>

            {/* Toggles Group */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              {/* Show in Contact Box */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Display in Contact Box</p>
                  <p className="text-[11px] text-zinc-500">
                    Shown in the left-side interactive Contact / Floating panel.
                  </p>
                </div>
                <Switch
                  checked={formShowInContact}
                  onCheckedChange={setFormShowInContact}
                />
              </div>

              {/* Show in Footer */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Display in Footer</p>
                  <p className="text-[11px] text-zinc-500">
                    Rendered in website footer social links. Default ON.
                  </p>
                </div>
                <Switch
                  checked={formShowInFooter}
                  onCheckedChange={setFormShowInFooter}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Active / Published</p>
                  <p className="text-[11px] text-zinc-500">
                    Inactive links are hidden from all public portfolio views.
                  </p>
                </div>
                <Switch
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1.5" />
                )}
                {isSubmitting
                  ? "Saving to Backend..."
                  : editingItem
                  ? "Update Link"
                  : "Save Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Social Link"
        itemName={deletingItem?.label}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
