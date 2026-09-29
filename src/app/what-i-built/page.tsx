"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { WhatIBuilt } from "@/types/portfolio";
import {
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  Layers,
  Code,
  Cpu,
  Coins,
  CheckCircle2,
  RefreshCw,
  ArrowUpDown,
  GripVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { toast } from "sonner";
import { useDragReorder } from "@/hooks/useDragReorder";

export default function WhatIBuiltPage() {
  const { portfolioData, api, mutatePortfolio, isLoading, toggleItemHomepage, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert } = useAuth();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "visible" | "hidden">("all");

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WhatIBuilt | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<WhatIBuilt | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formNumber, setFormNumber] = useState("01");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formTech, setFormTech] = useState("");
  const [formIconType, setFormIconType] = useState("fullstack");
  const [formIsPrimary, setFormIsPrimary] = useState(false);
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  const builtItems = portfolioData?.whatIBuilt || [];

  const filteredItems = useMemo(() => {
    return builtItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tech.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filterMode === "visible") return item.showOnHomepage;
      if (filterMode === "hidden") return !item.showOnHomepage;
      return true;
    });
  }, [builtItems, search, filterMode]);

  const isFilterActive = filterMode !== "all" || Boolean(search.trim());

  const { getItemProps, getHandleProps } = useDragReorder<WhatIBuilt>({
    items: builtItems,
    disabled: isFilterActive,
    onReorder: (newItems) => reorderItems("what-i-built", newItems),
  });

  const openCreateDialog = () => {
    setEditingItem(null);
    const nextNum = String(builtItems.length + 1).padStart(2, "0");
    setFormNumber(nextNum);
    setFormTitle("");
    setFormDescription("");
    setFormTech("Next.js · React · Node.js · PostgreSQL");
    setFormIconType("fullstack");
    setFormIsPrimary(false);
    setFormShowOnHomepage(true);
    setFormSortOrder(builtItems.length);
    setDialogOpen(true);
  };

  const openEditDialog = (item: WhatIBuilt) => {
    setEditingItem(item);
    setFormNumber(item.number);
    setFormTitle(item.title);
    setFormDescription(item.description);
    setFormTech(item.tech);
    setFormIconType(item.iconType || "fullstack");
    setFormIsPrimary(Boolean(item.isPrimary));
    setFormShowOnHomepage(Boolean(item.showOnHomepage));
    setFormSortOrder(item.sortOrder ?? 0);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: WhatIBuilt) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case "ai":
      case "ml":
        return <Cpu className="h-5 w-5 text-purple-400" />;
      case "blockchain":
      case "web3":
        return <Coins className="h-5 w-5 text-amber-400" />;
      default:
        return <Code className="h-5 w-5 text-indigo-400" />;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Title and Description are required");
      return;
    }

    const payload: Omit<WhatIBuilt, "id"> = {
      number: formNumber.trim() || "01",
      title: formTitle.trim(),
      description: formDescription.trim(),
      tech: formTech.trim(),
      iconType: formIconType.trim(),
      isPrimary: formIsPrimary,
      showOnHomepage: formShowOnHomepage,
      sortOrder: Number(formSortOrder) || 0,
    };

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.updateWhatIBuilt(editingItem.id, payload);
        toast.success(`Domain "${formTitle}" updated!`);
      } else {
        await api.createWhatIBuilt(payload);
        toast.success(`Domain "${formTitle}" added!`);
      }
      setDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save item";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Operation Failed", { description: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await api.deleteWhatIBuilt(deletingItem.id);
      toast.success(`Domain "${deletingItem.title}" deleted.`);
      setDeleteDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete item";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Delete Failed", { description: msg });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            "What I Built" Focus Areas
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Showcase your primary engineering pillars (Full-Stack, AI & ML, Blockchain & Web3) on the homepage.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          Add Focus Pillar
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search focus pillars, technologies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/60"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800 px-3 py-1.5 rounded-lg">
            <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
            {isFilterActive ? "Clear filter to reorder" : "Drag cards to reorder"}
          </span>

          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({builtItems.length})
            </button>
            <button
              onClick={() => setFilterMode("visible")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "visible"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Homepage ({builtItems.filter((w) => w.showOnHomepage).length})
            </button>
            <button
              onClick={() => setFilterMode("hidden")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "hidden" ? "bg-zinc-800 text-zinc-300" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Hidden ({builtItems.filter((w) => !w.showOnHomepage).length})
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-16 text-center text-sm text-zinc-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading focus pillars...
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <Layers className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No focus pillars found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {search ? "No items match your search." : "No engineering pillars defined yet."}
          </p>
          <Button onClick={openCreateDialog} size="sm" className="mt-4">
            <Plus className="h-4 w-4 mr-1.5" /> Add Focus Area
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => {
            const itemProps = getItemProps(index, false);
            const handleProps = getHandleProps(index);
            return (
              <Card
                key={item.id}
                {...(!isFilterActive ? itemProps : {})}
                className={`border-zinc-800 bg-zinc-900/40 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:border-zinc-700 ${
                  item.isPrimary ? "ring-1 ring-indigo-500/40" : ""
                } ${!isFilterActive ? itemProps.className : ""}`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {!isFilterActive ? (
                        <div {...handleProps}>
                          <GripVertical className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="text-zinc-600 p-1" title="Clear filter to reorder">
                          <GripVertical className="h-5 w-5 opacity-25 cursor-not-allowed" />
                        </div>
                      )}
                      <span className="font-mono text-2xl font-black text-indigo-400">
                        {item.number}
                      </span>
                      <span className="font-mono text-xs text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60 font-semibold">
                        #{item.sortOrder ?? index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.isPrimary && (
                        <Badge variant="purple" className="text-[10px]">
                          Primary
                        </Badge>
                      )}
                      <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/60">
                        {getIconForType(item.iconType)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-bold text-lg text-white">{item.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/80">
                    <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                      Tech Stack:
                    </p>
                    <p className="text-xs font-mono text-indigo-300 bg-indigo-950/30 px-2.5 py-1.5 rounded-lg border border-indigo-500/20">
                      {item.tech}
                    </p>
                  </div>
                </div>

                {/* Card Footer with Switch */}
                <div className="p-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={Boolean(item.showOnHomepage)}
                      onCheckedChange={() =>
                        toggleItemHomepage("what-i-built", item)
                      }
                    />
                    <span
                      className={`font-medium ${
                        item.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {item.showOnHomepage ? "Live" : "Hidden"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(item)}
                      className="h-8 px-2 text-zinc-400 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(item)}
                      className="h-8 px-2"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Focus Pillar" : "Add Focus Pillar"}
            </DialogTitle>
            <DialogDescription>
              Showcase a primary engineering domain on your portfolio.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Number Label *</label>
                <Input
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  placeholder="01"
                  required
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Pillar Title *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Full-Stack Development"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Description *</label>
              <Textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="High-level description of what you architect and engineer in this field..."
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Technologies (dot-separated)</label>
              <Input
                value={formTech}
                onChange={(e) => setFormTech(e.target.value)}
                placeholder="Next.js · React · Node.js · PostgreSQL"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Icon Identifier</label>
                <select
                  value={formIconType}
                  onChange={(e) => setFormIconType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-200"
                >
                  <option value="fullstack">Full-Stack (Code)</option>
                  <option value="ai">AI & ML (Cpu)</option>
                  <option value="blockchain">Blockchain & Web3 (Coins)</option>
                  <option value="cloud">Cloud & DevOps</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Sort Order</label>
                <Input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Highlight as Primary</p>
                <p className="text-[11px] text-zinc-500">
                  Featured with glowing border accent on landing page.
                </p>
              </div>
              <Switch checked={formIsPrimary} onCheckedChange={setFormIsPrimary} />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Show on Live Homepage</p>
                <p className="text-[11px] text-zinc-500">
                  Display this block in the "What I Built" grid on the website.
                </p>
              </div>
              <Switch
                checked={formShowOnHomepage}
                onCheckedChange={setFormShowOnHomepage}
              />
            </div>

            <DialogFooter>
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
                  ? "Update Pillar"
                  : "Add Pillar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Focus Pillar"
        itemName={deletingItem?.title}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
