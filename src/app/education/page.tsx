"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { Education } from "@/types/portfolio";
import {
  GraduationCap,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  School,
  Award,
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

export default function EducationPage() {
  const { portfolioData, api, mutatePortfolio, isLoading, toggleItemHomepage, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert } = useAuth();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "visible" | "hidden">("all");

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEducation, setDeletingEducation] = useState<Education | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formInstitution, setFormInstitution] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formResult, setFormResult] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formIcon, setFormIcon] = useState("🎓");
  const [formDescription, setFormDescription] = useState("");
  const [formGradYear, setFormGradYear] = useState<number | "">("");
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  const educationList = portfolioData?.education || [];

  const filteredEducation = useMemo(() => {
    return educationList.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.institution.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filterMode === "visible") return item.showOnHomepage;
      if (filterMode === "hidden") return !item.showOnHomepage;
      return true;
    });
  }, [educationList, search, filterMode]);

  const isFilterActive = filterMode !== "all" || Boolean(search.trim());

  const { getItemProps, getHandleProps } = useDragReorder<Education>({
    items: educationList,
    disabled: isFilterActive,
    onReorder: (newItems) => reorderItems("education", newItems),
  });

  const openCreateDialog = () => {
    setEditingEducation(null);
    setFormTitle("");
    setFormInstitution("");
    setFormImage("");
    setFormResult("GPA 5.00");
    setFormDate("Completed");
    setFormIcon("🎓");
    setFormDescription("");
    setFormGradYear("");
    setFormShowOnHomepage(true);
    setFormSortOrder(educationList.length);
    setDialogOpen(true);
  };

  const openEditDialog = (item: Education) => {
    setEditingEducation(item);
    setFormTitle(item.title);
    setFormInstitution(item.institution);
    setFormImage(item.image || "");
    setFormResult(item.result);
    setFormDate(item.date);
    setFormIcon(item.icon || "🎓");
    setFormDescription(item.description);
    setFormGradYear(item.expectedGraduationYear ?? "");
    setFormShowOnHomepage(Boolean(item.showOnHomepage));
    setFormSortOrder(item.sortOrder ?? 0);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: Education) => {
    setDeletingEducation(item);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formInstitution.trim()) {
      toast.error("Degree Title and Institution are required");
      return;
    }

    const payload: Omit<Education, "id"> = {
      title: formTitle.trim(),
      institution: formInstitution.trim(),
      image: formImage.trim() || null,
      result: formResult.trim(),
      date: formDate.trim(),
      icon: formIcon.trim() || "🎓",
      description: formDescription.trim(),
      expectedGraduationYear: formGradYear ? Number(formGradYear) : null,
      showOnHomepage: formShowOnHomepage,
      sortOrder: Number(formSortOrder) || 0,
    };

    setIsSubmitting(true);
    try {
      if (editingEducation) {
        await api.updateEducation(editingEducation.id, payload);
        toast.success(`Education at ${formInstitution} updated!`);
      } else {
        await api.createEducation(payload);
        toast.success(`Education entry added successfully!`);
      }
      setDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save education";
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
    if (!deletingEducation) return;
    setIsDeleting(true);
    try {
      await api.deleteEducation(deletingEducation.id);
      toast.success(`Education entry deleted.`);
      setDeleteDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete education";
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
            <GraduationCap className="h-6 w-6 text-indigo-400" />
            Education Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your degrees, institutions, results, academic milestones, and homepage display.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          Add Education
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search degrees, institutions, subjects..."
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
              All ({educationList.length})
            </button>
            <button
              onClick={() => setFilterMode("visible")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "visible"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Homepage ({educationList.filter((e) => e.showOnHomepage).length})
            </button>
            <button
              onClick={() => setFilterMode("hidden")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "hidden" ? "bg-zinc-800 text-zinc-300" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Hidden ({educationList.filter((e) => !e.showOnHomepage).length})
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-16 text-center text-sm text-zinc-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading education history...
        </div>
      ) : filteredEducation.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <GraduationCap className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No education entries found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {search ? "No entries match your search." : "No academic history added yet."}
          </p>
          <Button onClick={openCreateDialog} size="sm" className="mt-4">
            <Plus className="h-4 w-4 mr-1.5" /> Add Academic Credential
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEducation.map((item, index) => {
            const itemProps = getItemProps(index, false);
            const handleProps = getHandleProps(index);
            return (
              <Card
                key={item.id}
                {...(!isFilterActive ? itemProps : {})}
                className={`border-zinc-800 bg-zinc-900/40 backdrop-blur-xl hover:border-zinc-700 transition-all duration-300 flex flex-col justify-between ${
                  !isFilterActive ? itemProps.className : ""
                }`}
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5">
                      <div className="h-12 w-12 rounded-xl bg-zinc-800 border border-zinc-700/60 overflow-hidden shrink-0 flex items-center justify-center text-2xl shadow-inner">
                        {item.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={item.image}
                            alt={item.institution}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          item.icon || "🎓"
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="font-bold text-base text-white">{item.title}</h3>
                        <p className="text-xs text-indigo-400 font-medium flex items-center gap-1.5">
                          <School className="h-3.5 w-3.5" />
                          {item.institution}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isFilterActive ? (
                        <div {...handleProps}>
                          <GripVertical className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="text-zinc-600 p-1" title="Clear filter to reorder">
                          <GripVertical className="h-4 w-4 opacity-25 cursor-not-allowed" />
                        </div>
                      )}
                      <span className="font-mono text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-2 py-0.5 rounded font-semibold">
                        #{item.sortOrder ?? index + 1}
                      </span>
                    </div>
                  </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  {item.result && (
                    <Badge variant="success" className="gap-1 font-mono text-[11px]">
                      <Award className="h-3 w-3" /> {item.result}
                    </Badge>
                  )}
                  {item.date && (
                    <Badge variant="outline" className="gap-1 font-mono text-[11px] text-zinc-400">
                      <Calendar className="h-3 w-3" /> {item.date}
                    </Badge>
                  )}
                  {item.expectedGraduationYear && (
                    <Badge variant="secondary" className="font-mono text-[11px]">
                      Grad: {item.expectedGraduationYear}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Footer Switch & Action Buttons */}
              <div className="p-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/40 text-xs">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={Boolean(item.showOnHomepage)}
                    onCheckedChange={() =>
                      toggleItemHomepage("education", item)
                    }
                  />
                  <span
                    className={`font-medium ${
                      item.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                    }`}
                  >
                    {item.showOnHomepage ? "Live on Site" : "Hidden"}
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
            <DialogTitle>{editingEducation ? "Edit Education" : "Add Education"}</DialogTitle>
            <DialogDescription>
              Record degree, academic institution, completion date, and result.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Degree / Certificate Title *</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. B.Sc in Computer Science & Engineering"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Institution / University *</label>
              <Input
                value={formInstitution}
                onChange={(e) => setFormInstitution(e.target.value)}
                placeholder="e.g. Khulna University of Engineering & Technology"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Institute Logo Image URL</label>
              <div className="flex items-center gap-3">
                <Input
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://... or /images/kuet-logo.png"
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
                Optional institute badge/logo image. Falls back to emoji icon below if omitted.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Result / Grade</label>
                <Input
                  value={formResult}
                  onChange={(e) => setFormResult(e.target.value)}
                  placeholder="e.g. GPA 5.00 or 3rd Year"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Date / Status</label>
                <Input
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  placeholder="e.g. Present or Completed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Icon Emoji</label>
                <Input
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="🎓, 🏛️, 🏫"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Expected Graduation Year</label>
                <Input
                  type="number"
                  value={formGradYear}
                  onChange={(e) => setFormGradYear(e.target.value ? Number(e.target.value) : "")}
                  placeholder="e.g. 2027 (optional)"
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

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Description / Focus Areas</label>
              <Textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Built a strong foundation in scalable software, AI, and mathematics..."
              />
            </div>

            {/* Homepage Toggle in Modal */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Show on Live Homepage</p>
                <p className="text-[11px] text-zinc-500">
                  Feature this qualification on the portfolio education section.
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
                  : editingEducation
                  ? "Update Education"
                  : "Add Education"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Education"
        itemName={deletingEducation ? `${deletingEducation.title} (${deletingEducation.institution})` : ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
