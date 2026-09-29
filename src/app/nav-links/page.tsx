"use client";

import React, { useState } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { NavLink } from "@/types/portfolio";
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Hash,
  GripVertical,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "sonner";
import { useDragReorder } from "@/hooks/useDragReorder";

export default function NavLinksPage() {
  const { portfolioData, api, mutatePortfolio, isLoading, toggleItemHomepage, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert } = useAuth();

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavLink | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<NavLink | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formNavId, setFormNavId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(true);

  const navLinks = portfolioData?.navLinks || [];

  const { getItemProps, getHandleProps } = useDragReorder<NavLink>({
    items: navLinks,
    onReorder: (newItems) => reorderItems("nav-links", newItems),
  });

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormNavId("");
    setFormTitle("");
    setFormSortOrder(navLinks.length);
    setFormShowOnHomepage(true);
    setDialogOpen(true);
  };

  const openEditDialog = (item: NavLink) => {
    setEditingItem(item);
    setFormNavId(item.navId);
    setFormTitle(item.title);
    setFormSortOrder(item.sortOrder ?? 0);
    setFormShowOnHomepage(item.showOnHomepage !== false);
    setDialogOpen(true);
  };

  const openDeleteDialog = (item: NavLink) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formNavId.trim()) {
      toast.error("Menu Title and Anchor Nav ID are required");
      return;
    }

    const payload: Omit<NavLink, "id"> = {
      navId: formNavId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""),
      title: formTitle.trim(),
      sortOrder: Number(formSortOrder) || 0,
      showOnHomepage: formShowOnHomepage,
    };

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await api.updateNavLink(editingItem.id, payload);
        toast.success(`Nav Link "${formTitle}" updated!`);
      } else {
        await api.createNavLink(payload);
        toast.success(`Nav Link "${formTitle}" added!`);
      }
      setDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save nav link";
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
      await api.deleteNavLink(deletingItem.id);
      toast.success(`Nav link "${deletingItem.title}" deleted.`);
      setDeleteDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete nav link";
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
            <Compass className="h-6 w-6 text-indigo-400" />
            Navigation Links Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Configure the main header navigation menu and anchor section links.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          Add Navigation Link
        </Button>
      </div>

      {/* Table */}
      <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <CardHeader className="border-b border-zinc-800/80 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-base">Website Header Navigation Items</CardTitle>
            <CardDescription>
              Links shown in the top navigation bar of your portfolio.
            </CardDescription>
          </div>
          <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1 rounded-full w-fit">
            <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
            Drag rows to reorder
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-16 text-center text-sm text-zinc-500">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Loading navigation links...
            </div>
          ) : navLinks.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No navigation links found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 text-center" title="Drag to reorder"></TableHead>
                  <TableHead className="w-16">ID</TableHead>
                  <TableHead>Menu Title</TableHead>
                  <TableHead>Anchor ID (#)</TableHead>
                  <TableHead className="w-24 text-center">Order</TableHead>
                  <TableHead className="w-36 text-center">Homepage Switch</TableHead>
                  <TableHead className="w-28 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {navLinks.map((link, index) => {
                  const itemProps = getItemProps(index, true);
                  const handleProps = getHandleProps(index);
                  return (
                    <TableRow
                      key={link.id}
                      {...itemProps}
                      className={`group ${itemProps.className}`}
                    >
                      <TableCell className="w-10 text-center px-1">
                        <div {...handleProps}>
                          <GripVertical className="h-4 w-4" />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-zinc-500">
                        #{link.id}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-200">
                        {link.title}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-500/20 inline-flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {link.navId}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-zinc-400">
                        <span className="inline-block px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 font-semibold text-zinc-300">
                          #{link.sortOrder ?? index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Switch
                            checked={link.showOnHomepage !== false}
                            onCheckedChange={() =>
                              toggleItemHomepage("nav-links", link)
                            }
                          />
                          <span
                            className={`text-xs font-medium ${
                              link.showOnHomepage !== false ? "text-emerald-400" : "text-zinc-500"
                            }`}
                          >
                            {link.showOnHomepage !== false ? "Active" : "Hidden"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(link)}
                            className="h-8 w-8 text-zinc-400 hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => openDeleteDialog(link)}
                            className="h-8 w-8"
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
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Navigation Link" : "Add Navigation Link"}
            </DialogTitle>
            <DialogDescription>
              Set label and target section anchor.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Menu Title *</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Projects or Contact"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Anchor ID (#) *</label>
              <Input
                value={formNavId}
                onChange={(e) => setFormNavId(e.target.value)}
                placeholder="e.g. projects"
                required
              />
              <p className="text-[11px] text-zinc-500">
                Corresponds to the HTML element ID on the page (e.g., <code className="text-zinc-400">#projects</code>).
              </p>
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
                <p className="text-xs font-semibold text-zinc-200">Show in Navigation</p>
                <p className="text-[11px] text-zinc-500">
                  Visible in header menu bar.
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
                  ? "Update Link"
                  : "Add Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Navigation Link"
        itemName={deletingItem?.title}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
