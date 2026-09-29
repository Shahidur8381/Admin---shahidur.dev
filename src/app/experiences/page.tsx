"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { Experience } from "@/types/portfolio";
import {
  Briefcase,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  ListPlus,
  X,
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

export default function ExperiencesPage() {
  const { portfolioData, api, mutatePortfolio, isLoading, toggleItemHomepage, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert } = useAuth();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "visible" | "hidden">("all");

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExperience, setDeletingExperience] = useState<Experience | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formCompanyName, setFormCompanyName] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formIcon, setFormIcon] = useState("💼");
  const [formIconBg, setFormIconBg] = useState("#050907");
  const [formPoints, setFormPoints] = useState<string[]>([]);
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  // New point input
  const [pointInput, setPointInput] = useState("");

  const experiences = portfolioData?.experiences || [];

  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const matchesSearch =
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        exp.companyName.toLowerCase().includes(search.toLowerCase()) ||
        exp.points?.some((p) => p.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterMode === "visible") return exp.showOnHomepage;
      if (filterMode === "hidden") return !exp.showOnHomepage;
      return true;
    });
  }, [experiences, search, filterMode]);

  const isFilterActive = filterMode !== "all" || Boolean(search.trim());

  const { getItemProps, getHandleProps } = useDragReorder<Experience>({
    items: experiences,
    disabled: isFilterActive,
    onReorder: (newItems) => reorderItems("experiences", newItems),
  });

  const openCreateDialog = () => {
    setEditingExperience(null);
    setFormTitle("");
    setFormCompanyName("");
    setFormImage("");
    setFormSlug("");
    setFormDate("2026 - Present");
    setFormIcon("💼");
    setFormIconBg("#050907");
    setFormPoints([
      "Engineered backend systems to support highly scalable applications.",
      "Optimized API response times and integrated robust architecture.",
    ]);
    setFormShowOnHomepage(true);
    setFormSortOrder(experiences.length);
    setDialogOpen(true);
  };

  const openEditDialog = (exp: Experience) => {
    setEditingExperience(exp);
    setFormTitle(exp.title);
    setFormCompanyName(exp.companyName);
    setFormImage(exp.image || "");
    setFormSlug(exp.slug || "");
    setFormDate(exp.date);
    setFormIcon(exp.icon || "💼");
    setFormIconBg(exp.iconBg || "#050907");
    setFormPoints(Array.isArray(exp.points) ? [...exp.points] : []);
    setFormShowOnHomepage(Boolean(exp.showOnHomepage));
    setFormSortOrder(exp.sortOrder ?? 0);
    setDialogOpen(true);
  };

  const openDeleteDialog = (exp: Experience) => {
    setDeletingExperience(exp);
    setDeleteDialogOpen(true);
  };

  const handleAddPoint = () => {
    const trimmed = pointInput.trim();
    if (!trimmed) return;
    setFormPoints([...formPoints, trimmed]);
    setPointInput("");
  };

  const handleRemovePoint = (index: number) => {
    setFormPoints(formPoints.filter((_, i) => i !== index));
  };

  const handleUpdatePoint = (index: number, val: string) => {
    const updated = [...formPoints];
    updated[index] = val;
    setFormPoints(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCompanyName.trim()) {
      toast.error("Job Title and Company Name are required");
      return;
    }

    const slug =
      formSlug.trim() ||
      `${formCompanyName}-${formTitle}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload: Omit<Experience, "id"> = {
      title: formTitle.trim(),
      companyName: formCompanyName.trim(),
      image: formImage.trim() || null,
      slug,
      date: formDate.trim(),
      icon: formIcon.trim() || "💼",
      iconBg: formIconBg.trim() || "#050907",
      points: formPoints.filter((p) => p.trim().length > 0),
      showOnHomepage: formShowOnHomepage,
      sortOrder: Number(formSortOrder) || 0,
    };

    setIsSubmitting(true);
    try {
      if (editingExperience) {
        await api.updateExperience(editingExperience.id, payload);
        toast.success(`Experience at ${formCompanyName} updated!`);
      } else {
        await api.createExperience(payload);
        toast.success(`Experience at ${formCompanyName} added!`);
      }
      setDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save experience";
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
    if (!deletingExperience) return;
    setIsDeleting(true);
    try {
      await api.deleteExperience(deletingExperience.id);
      toast.success(`Experience at "${deletingExperience.companyName}" deleted.`);
      setDeleteDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete experience";
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
            <Briefcase className="h-6 w-6 text-indigo-400" />
            Experiences Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Organize career history, companies, bullet achievements, and timeline visibility.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          Add Experience
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search roles, companies, keywords..."
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
              All ({experiences.length})
            </button>
            <button
              onClick={() => setFilterMode("visible")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "visible"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Homepage ({experiences.filter((e) => e.showOnHomepage).length})
            </button>
            <button
              onClick={() => setFilterMode("hidden")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "hidden" ? "bg-zinc-800 text-zinc-300" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Hidden ({experiences.filter((e) => !e.showOnHomepage).length})
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-16 text-center text-sm text-zinc-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading experiences...
        </div>
      ) : filteredExperiences.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <Briefcase className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No experiences found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {search ? "No experiences match your search." : "No career milestones added yet."}
          </p>
          <Button onClick={openCreateDialog} size="sm" className="mt-4">
            <Plus className="h-4 w-4 mr-1.5" /> Add First Experience
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExperiences.map((exp, index) => {
            const itemProps = getItemProps(index, false);
            const handleProps = getHandleProps(index);
            return (
              <Card
                key={exp.id}
                {...(!isFilterActive ? itemProps : {})}
                className={`border-zinc-800 bg-zinc-900/40 backdrop-blur-xl hover:border-zinc-700 transition-all duration-300 overflow-hidden ${
                  !isFilterActive ? itemProps.className : ""
                }`}
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      {/* Drag Handle & Order Badge */}
                      <div className="flex flex-col items-center gap-1 self-center md:self-start pt-1">
                        {!isFilterActive ? (
                          <div {...handleProps}>
                            <GripVertical className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="text-zinc-600 p-1" title="Clear filter to reorder">
                            <GripVertical className="h-5 w-5 opacity-25 cursor-not-allowed" />
                          </div>
                        )}
                        <span className="font-mono text-[10px] text-zinc-300 bg-zinc-800/80 px-1.5 py-0.5 rounded border border-zinc-700/60 font-semibold">
                          #{exp.sortOrder ?? index + 1}
                        </span>
                      </div>

                      {/* Icon or Image bubble */}
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border border-zinc-700/60 shadow-inner overflow-hidden"
                        style={{ backgroundColor: exp.image ? "transparent" : (exp.iconBg || "#050907") }}
                      >
                        {exp.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={exp.image}
                            alt={exp.companyName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          exp.icon || "💼"
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg text-white">{exp.title}</h3>
                          <span className="text-zinc-500">•</span>
                          <span className="font-medium text-indigo-400 text-sm">
                            {exp.companyName}
                          </span>
                          {exp.slug && (
                            <span className="font-mono text-[10px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800">
                              {exp.slug}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{exp.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions & Homepage Switch */}
                    <div className="flex items-center gap-3 self-end md:self-auto shrink-0 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800/80">
                      <div className="flex items-center gap-2 pr-2 border-r border-zinc-800">
                        <span
                          className={`text-xs font-medium ${
                            exp.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                          }`}
                        >
                          {exp.showOnHomepage ? "Live on Site" : "Hidden"}
                        </span>
                        <Switch
                          checked={Boolean(exp.showOnHomepage)}
                          onCheckedChange={() =>
                            toggleItemHomepage("experiences", exp)
                          }
                        />
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(exp)}
                        className="h-8 px-2 text-zinc-400 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openDeleteDialog(exp)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Bullets */}
                  {exp.points && exp.points.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 pl-2">
                      <ul className="space-y-1.5">
                        {exp.points.map((pt, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingExperience ? "Edit Experience" : "Add Experience"}</DialogTitle>
            <DialogDescription>
              Detail your role, company, dates, and bulleted achievements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Job Title *</label>
                <Input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Backend AI Engineer Intern"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Company Name *</label>
                <Input
                  value={formCompanyName}
                  onChange={(e) => setFormCompanyName(e.target.value)}
                  placeholder="e.g. FlyRant AI"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Company Logo Image URL</label>
              <div className="flex items-center gap-3">
                <Input
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://... or /assets/flyrant.png"
                  className="flex-1"
                />
                {formImage.trim() ? (
                  <div className="h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formImage.trim()}
                      alt="Logo Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : null}
              </div>
              <p className="text-[11px] text-zinc-500">
                Optional company logo image. Falls back to emoji icon below if omitted.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Date Range</label>
                <Input
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  placeholder="e.g. Jul 2026 - Oct 2026"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Icon Emoji</label>
                <Input
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="🤖, 💻, ⛓️, 💼"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Icon Background</label>
                <Input
                  value={formIconBg}
                  onChange={(e) => setFormIconBg(e.target.value)}
                  placeholder="#050907"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Slug Identifier</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. flyrant-ai"
                />
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

            {/* Bullet Points Manager */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <ListPlus className="h-3.5 w-3.5 text-zinc-400" />
                Key Responsibilities & Achievements
              </label>

              <div className="flex gap-2">
                <Input
                  value={pointInput}
                  onChange={(e) => setPointInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                  placeholder="Add bullet point achievement..."
                  className="text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddPoint}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Bullet
                </Button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formPoints.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-xs font-mono text-zinc-500 mt-2">{idx + 1}.</span>
                    <Textarea
                      rows={2}
                      value={pt}
                      onChange={(e) => handleUpdatePoint(idx, e.target.value)}
                      className="text-xs min-h-[50px] flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(idx)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors mt-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Homepage Toggle in Modal */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Show on Live Homepage</p>
                <p className="text-[11px] text-zinc-500">
                  Feature this experience in your interactive career timeline.
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
                  : editingExperience
                  ? "Update Experience"
                  : "Create Experience"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Experience"
        itemName={deletingExperience ? `${deletingExperience.title} @ ${deletingExperience.companyName}` : ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
