"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { Testimonial } from "@/types/portfolio";
import {
  MessageSquareQuote,
  Plus,
  Search,
  Edit2,
  Trash2,
  Sparkles,
  Building,
  Quote,
  RefreshCw,
  User,
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

export default function TestimonialsPage() {
  const { portfolioData, api, mutatePortfolio, isLoading, toggleItemHomepage, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert } = useAuth();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "visible" | "hidden">("all");

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Testimonial | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formTestimonial, setFormTestimonial] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);

  const testimonials = portfolioData?.testimonials || [];

  const filteredTestimonials = useMemo(() => {
    return testimonials.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.company.toLowerCase().includes(search.toLowerCase()) ||
        t.designation.toLowerCase().includes(search.toLowerCase()) ||
        t.testimonial.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filterMode === "visible") return t.showOnHomepage;
      if (filterMode === "hidden") return !t.showOnHomepage;
      return true;
    });
  }, [testimonials, search, filterMode]);

  const isFilterActive = filterMode !== "all" || Boolean(search.trim());

  const { getItemProps, getHandleProps } = useDragReorder<Testimonial>({
    items: testimonials,
    disabled: isFilterActive,
    onReorder: (newItems) => reorderItems("testimonials", newItems),
  });

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormName("");
    setFormDesignation("");
    setFormCompany("");
    setFormTestimonial("");
    setFormImage(`https://randomuser.me/api/portraits/men/${testimonials.length + 10}.jpg`);
    setFormShowOnHomepage(true);
    setFormSortOrder(testimonials.length);
    setDialogOpen(true);
  };

  const openEditDialog = (t: Testimonial) => {
    setEditingItem(t);
    setFormName(t.name);
    setFormDesignation(t.designation);
    setFormCompany(t.company);
    setFormTestimonial(t.testimonial);
    setFormImage(t.image || "");
    setFormShowOnHomepage(Boolean(t.showOnHomepage));
    setFormSortOrder(t.sortOrder ?? 0);
    setDialogOpen(true);
  };

  const openDeleteDialog = (t: Testimonial) => {
    setDeletingItem(t);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTestimonial.trim()) {
      toast.error("Client Name and Testimonial Quote are required");
      return;
    }

    const payload: Omit<Testimonial, "id"> = {
      name: formName.trim(),
      designation: formDesignation.trim(),
      company: formCompany.trim(),
      testimonial: formTestimonial.trim(),
      image: formImage.trim() || "https://randomuser.me/api/portraits/lego/1.jpg",
      showOnHomepage: formShowOnHomepage,
      sortOrder: Number(formSortOrder) || 0,
    };

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.updateTestimonial(editingItem.id, payload);
        toast.success(`Testimonial by ${formName} updated!`);
      } else {
        await api.createTestimonial(payload);
        toast.success(`Testimonial added!`);
      }
      setDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save testimonial";
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
      await api.deleteTestimonial(deletingItem.id);
      toast.success(`Testimonial deleted.`);
      setDeleteDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete testimonial";
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
            <MessageSquareQuote className="h-6 w-6 text-indigo-400" />
            Client Testimonials Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage feedback, client endorsements, avatars, and homepage slider visibility.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search client name, company, quote keywords..."
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
              All ({testimonials.length})
            </button>
            <button
              onClick={() => setFilterMode("visible")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "visible"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Homepage ({testimonials.filter((t) => t.showOnHomepage).length})
            </button>
            <button
              onClick={() => setFilterMode("hidden")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "hidden" ? "bg-zinc-800 text-zinc-300" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Hidden ({testimonials.filter((t) => !t.showOnHomepage).length})
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="p-16 text-center text-sm text-zinc-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading testimonials...
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <Quote className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No testimonials found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {search ? "No testimonials match your search." : "No client endorsements added yet."}
          </p>
          <Button onClick={openCreateDialog} size="sm" className="mt-4">
            <Plus className="h-4 w-4 mr-1.5" /> Add First Testimonial
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map((t, index) => {
            const itemProps = getItemProps(index, false);
            const handleProps = getHandleProps(index);
            return (
              <Card
                key={t.id}
                {...(!isFilterActive ? itemProps : {})}
                className={`border-zinc-800 bg-zinc-900/40 backdrop-blur-xl flex flex-col justify-between hover:border-zinc-700 transition-all duration-300 relative ${
                  !isFilterActive ? itemProps.className : ""
                }`}
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <Quote className="h-8 w-8 text-indigo-500/25" />
                    <div className="flex items-center gap-1.5">
                      {!isFilterActive ? (
                        <div {...handleProps}>
                          <GripVertical className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="text-zinc-600 p-1" title="Clear filter to reorder">
                          <GripVertical className="h-4 w-4 opacity-25 cursor-not-allowed" />
                        </div>
                      )}
                      <span className="font-mono text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700/60 px-1.5 py-0.5 rounded font-semibold">
                        #{t.sortOrder ?? index + 1}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-zinc-300 leading-relaxed italic line-clamp-4">
                    "{t.testimonial}"
                  </p>

                  <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/80">
                    <div className="relative h-11 w-11 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700/60 shrink-0">
                      {t.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={t.image}
                          alt={t.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <User className="h-6 w-6 text-zinc-500 m-auto mt-2" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-white truncate">{t.name}</h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {t.designation} <span className="text-zinc-600">@</span> {t.company}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Switch */}
                <div className="p-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between bg-zinc-950/40 text-xs">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={Boolean(t.showOnHomepage)}
                      onCheckedChange={() =>
                        toggleItemHomepage("testimonials", t)
                      }
                    />
                    <span
                      className={`font-medium ${
                        t.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {t.showOnHomepage ? "Live" : "Hidden"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(t)}
                      className="h-8 px-2 text-zinc-400 hover:text-white"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openDeleteDialog(t)}
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
              {editingItem ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
            <DialogDescription>
              Client testimonial, author credentials, and avatar photo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Client / Endorser Name *</label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Sara Lee"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Designation / Role</label>
                <Input
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  placeholder="e.g. Chief Technology Officer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Company Name</label>
                <Input
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Avatar Image URL</label>
              <Input
                value={formImage}
                onChange={(e) => setFormImage(e.target.value)}
                placeholder="https://randomuser.me/api/portraits/women/4.jpg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Testimonial Quote *</label>
              <Textarea
                rows={4}
                value={formTestimonial}
                onChange={(e) => setFormTestimonial(e.target.value)}
                placeholder="What the client said about your work, problem-solving, and communication..."
                required
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

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Show on Live Homepage</p>
                <p className="text-[11px] text-zinc-500">
                  Feature this review in your social proof slider.
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
                  ? "Update Review"
                  : "Add Review"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Testimonial"
        itemName={deletingItem ? `Testimonial by ${deletingItem.name}` : ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
