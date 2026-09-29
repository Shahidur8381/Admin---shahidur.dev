"use client";

import React, { useState, useMemo } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { Project, ProjectTag } from "@/types/portfolio";
import {
  FolderGit2,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Tag as TagIcon,
  X,
  RefreshCw,
  LayoutGrid,
  List,
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
import { truncate } from "@/lib/utils";
import { useDragReorder } from "@/hooks/useDragReorder";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const COLOR_PRESETS = [
  { label: "Blue Gradient", value: "blue-text-gradient", bg: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Green Gradient", value: "green-text-gradient", bg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  { label: "Pink Gradient", value: "pink-text-gradient", bg: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  { label: "Orange Gradient", value: "orange-text-gradient", bg: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { label: "Purple Gradient", value: "purple-text-gradient", bg: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
];

const CATEGORY_PRESETS = [
  "Full-Stack",
  "Frontend",
  "AI & ML",
  "Web3 & Blockchain",
  "Mobile",
  "DevOps & Cloud",
];

export default function ProjectsPage() {
  const { portfolioData, api, mutatePortfolio, isLoading, toggleItemHomepage, reorderItems } = usePortfolioApi();
  const { triggerTotpAlert } = useAuth();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "visible" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");

  // Modal states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategory, setFormCategory] = useState("Full-Stack");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formSourceCode, setFormSourceCode] = useState("");
  const [formLiveDemo, setFormLiveDemo] = useState("");
  const [formShowOnHomepage, setFormShowOnHomepage] = useState(true);
  const [formSortOrder, setFormSortOrder] = useState<number>(0);
  const [formTags, setFormTags] = useState<ProjectTag[]>([]);

  // Tag creator inside modal
  const [tagInput, setTagInput] = useState("");
  const [tagColor, setTagColor] = useState("blue-text-gradient");

  const projects = portfolioData?.projects || [];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        (project.category && project.category.toLowerCase().includes(search.toLowerCase())) ||
        project.description.toLowerCase().includes(search.toLowerCase()) ||
        project.tags?.some((t) => t.name.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;
      if (filterMode === "visible") return project.showOnHomepage;
      if (filterMode === "hidden") return !project.showOnHomepage;
      return true;
    });
  }, [projects, search, filterMode]);

  const isFilterActive = filterMode !== "all" || Boolean(search.trim());

  const { getItemProps, getHandleProps } = useDragReorder<Project>({
    items: projects,
    disabled: isFilterActive,
    onReorder: (newItems) => reorderItems("projects", newItems),
  });

  const openCreateDialog = () => {
    setEditingProject(null);
    setFormName("");
    setFormSlug("");
    setFormCategory("Full-Stack");
    setFormDescription("");
    setFormImage("");
    setFormSourceCode("https://github.com/");
    setFormLiveDemo("");
    setFormShowOnHomepage(true);
    setFormSortOrder(projects.length);
    setFormTags([
      { name: "react", color: "blue-text-gradient" },
      { name: "tailwind", color: "pink-text-gradient" },
    ]);
    setDialogOpen(true);
  };

  const openEditDialog = (proj: Project) => {
    setEditingProject(proj);
    setFormName(proj.name);
    setFormSlug(proj.slug || "");
    setFormCategory(proj.category || "Full-Stack");
    setFormDescription(proj.description || "");
    setFormImage(proj.image || "");
    setFormSourceCode(proj.sourceCodeLink || "");
    setFormLiveDemo(proj.liveDemoLink || "");
    setFormShowOnHomepage(Boolean(proj.showOnHomepage));
    setFormSortOrder(proj.sortOrder ?? 0);
    setFormTags(Array.isArray(proj.tags) ? [...proj.tags] : []);
    setDialogOpen(true);
  };

  const openDeleteDialog = (proj: Project) => {
    setDeletingProject(proj);
    setDeleteDialogOpen(true);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed) return;
    if (formTags.some((t) => t.name === trimmed)) {
      toast.warning("Tag already added");
      return;
    }
    setFormTags([...formTags, { name: trimmed, color: tagColor }]);
    setTagInput("");
  };

  const handleRemoveTag = (tagName: string) => {
    setFormTags(formTags.filter((t) => t.name !== tagName));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large", { description: "Maximum image size is 5MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        setIsSubmitting(true);
        const res = await api.uploadImage(base64, file.name);
        if (res.url) {
          setFormImage(res.url);
          toast.success("Image uploaded successfully!");
        } else {
          toast.error("Upload failed", { description: res.message });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload image";
        if (msg.includes("TOTP")) {
          triggerTotpAlert();
        } else {
          toast.error("Upload Error", { description: msg });
        }
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Project name is required");
      return;
    }

    const slug =
      formSlug.trim() ||
      formName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const payload: Omit<Project, "id"> = {
      name: formName.trim(),
      slug,
      category: formCategory.trim() || "Full-Stack",
      description: formDescription.trim(),
      image: formImage.trim() || "/assets/placeholder.png",
      sourceCodeLink: formSourceCode.trim(),
      liveDemoLink: formLiveDemo.trim() || null,
      showOnHomepage: formShowOnHomepage,
      sortOrder: Number(formSortOrder) || 0,
      tags: formTags,
    };

    setIsSubmitting(true);
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
        toast.success(`Project "${formName}" updated successfully!`);
      } else {
        await api.createProject(payload);
        toast.success(`Project "${formName}" created successfully!`);
      }
      setDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save project";
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
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      await api.deleteProject(deletingProject.id);
      toast.success(`Project "${deletingProject.name}" deleted.`);
      setDeleteDialogOpen(false);
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete project";
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
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-indigo-400" />
            Projects Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Create, edit, delete, and control homepage showcase visibility for all portfolio projects.
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2 shadow-lg shadow-indigo-500/25">
          <Plus className="h-4 w-4" />
          Add New Project
        </Button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search projects by name, description, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-950/60"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "all"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              All ({projects.length})
            </button>
            <button
              onClick={() => setFilterMode("visible")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "visible"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Homepage ({projects.filter((p) => p.showOnHomepage).length})
            </button>
            <button
              onClick={() => setFilterMode("hidden")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                filterMode === "hidden"
                  ? "bg-zinc-800 text-zinc-300"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Hidden ({projects.filter((p) => !p.showOnHomepage).length})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-zinc-950/60 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "cards" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "table" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
              title="Data Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800 px-2.5 py-1.5 rounded-lg">
            <ArrowUpDown className="h-3.5 w-3.5 text-indigo-400" />
            {isFilterActive ? "Clear filter to reorder" : "Drag to reorder"}
          </span>
        </div>
      </div>

      {/* Projects Display */}
      {isLoading ? (
        <div className="p-16 text-center text-sm text-zinc-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-indigo-400" />
          Loading projects from backend...
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="border-dashed border-zinc-800 bg-zinc-900/20 p-12 text-center">
          <FolderGit2 className="h-10 w-10 mx-auto text-zinc-600 mb-3" />
          <h3 className="text-base font-semibold text-zinc-300">No projects found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
            {search ? "No projects match your search criteria." : "You have not added any projects yet."}
          </p>
          <Button onClick={openCreateDialog} size="sm" className="mt-4">
            <Plus className="h-4 w-4 mr-1.5" /> Create First Project
          </Button>
        </Card>
      ) : viewMode === "cards" ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, index) => {
            const itemProps = getItemProps(index, false);
            const handleProps = getHandleProps(index);
            return (
              <Card
                key={project.id}
                {...(!isFilterActive ? itemProps : {})}
                className={`flex flex-col justify-between overflow-hidden border-zinc-800 bg-zinc-900/40 backdrop-blur-xl group hover:border-zinc-700 transition-all duration-300 ${
                  !isFilterActive ? itemProps.className : ""
                }`}
              >
                <div>
                  {/* Project Image Preview */}
                  <div className="relative h-44 w-full bg-zinc-950 overflow-hidden border-b border-zinc-800/80">
                    {project.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={project.image}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : null}

                    {/* Top floating badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                      {!isFilterActive ? (
                        <div
                          {...handleProps}
                          className="p-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-zinc-400 hover:text-white cursor-grab active:cursor-grabbing shadow-sm"
                          title="Drag to reorder"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </div>
                      ) : (
                        <div className="p-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-zinc-600" title="Clear filter to reorder">
                          <GripVertical className="h-3.5 w-3.5 opacity-25 cursor-not-allowed" />
                        </div>
                      )}
                      <span className="font-mono text-[10px] bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-zinc-200 font-semibold">
                        #{project.sortOrder ?? index + 1}
                      </span>
                      {project.slug && (
                        <span className="font-mono text-[10px] bg-black/75 backdrop-blur-md px-2 py-0.5 rounded border border-white/10 text-indigo-300 hidden sm:inline-block">
                          {project.slug}
                        </span>
                      )}
                    </div>

                  {/* Homepage Switch Overlay in image corner */}
                  <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium ${
                        project.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                      }`}
                    >
                      {project.showOnHomepage ? "Live" : "Hidden"}
                    </span>
                    <Switch
                      checked={Boolean(project.showOnHomepage)}
                      onCheckedChange={() =>
                        toggleItemHomepage("projects", project)
                      }
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors">
                      {project.name}
                    </h3>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shrink-0">
                      {project.category || "Full-Stack"}
                    </Badge>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags?.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs bg-zinc-950/40">
                <div className="flex items-center gap-2">
                  {project.sourceCodeLink && (
                    <a
                      href={project.sourceCodeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      title="GitHub Repository"
                    >
                      <GithubIcon className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {project.liveDemoLink && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                      title="Live Demo"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(project)}
                    className="h-8 px-2 text-zinc-400 hover:text-white"
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openDeleteDialog(project)}
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
      ) : (
        /* Table View */
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10 text-center" title="Drag to reorder"></TableHead>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-20 text-center">Order</TableHead>
              <TableHead className="w-36 text-center">Homepage Switch</TableHead>
              <TableHead className="w-28 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project, index) => {
              const itemProps = getItemProps(index, true);
              const handleProps = getHandleProps(index);
              return (
                <TableRow
                  key={project.id}
                  {...(!isFilterActive ? itemProps : {})}
                  className={`hover:bg-zinc-800/30 ${!isFilterActive ? itemProps.className : ""}`}
                >
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
                  <TableCell className="font-mono text-xs text-zinc-500">
                    #{project.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 overflow-hidden shrink-0 border border-zinc-700/60">
                        {project.image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={project.image}
                            alt={project.name}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-200">{project.name}</p>
                        <p className="text-xs text-zinc-400 line-clamp-1">{project.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] uppercase font-mono text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      {project.category || "Full-Stack"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {project.tags?.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300"
                        >
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">
                    <span className="inline-block px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 font-semibold text-zinc-300">
                      #{project.sortOrder ?? index + 1}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={Boolean(project.showOnHomepage)}
                        onCheckedChange={() =>
                          toggleItemHomepage("projects", project)
                        }
                      />
                      <span
                        className={`text-xs font-medium ${
                          project.showOnHomepage ? "text-emerald-400" : "text-zinc-500"
                        }`}
                      >
                        {project.showOnHomepage ? "Live" : "Off"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(project)}
                        className="h-8 w-8 text-zinc-400 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => openDeleteDialog(project)}
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

      {/* Create / Edit Project Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <DialogDescription>
              Configure details, images, tech stack tags, and homepage visibility.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Project Name *</label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Car Rent Platform"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Slug / ID</label>
                <Input
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="e.g. car-rent"
                />
              </div>
            </div>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Category *</label>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {CATEGORY_PRESETS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                      formCategory === cat
                        ? "bg-emerald-500 text-black font-semibold shadow-sm"
                        : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <Input
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                placeholder="Category (e.g. Full-Stack, Frontend, AI & ML, Web3 & Blockchain)"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Description *</label>
              <Textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Detailed summary of the application, problem solved, and architecture..."
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Image Asset URL</label>
                <div className="flex gap-2">
                  <Input
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="/assets/carrent.png or https://..."
                    className="flex-1"
                  />
                  <div className="relative overflow-hidden inline-block shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                      title="Upload Image"
                    />
                    <Button type="button" variant="secondary" className="pointer-events-none">
                      Upload
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">GitHub Source Code Link</label>
                <Input
                  value={formSourceCode}
                  onChange={(e) => setFormSourceCode(e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Live Demo URL</label>
                <Input
                  value={formLiveDemo}
                  onChange={(e) => setFormLiveDemo(e.target.value)}
                  placeholder="https://myproject.com (optional)"
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

            {/* Tag Manager */}
            <div className="space-y-2.5 pt-2 border-t border-zinc-800">
              <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                <TagIcon className="h-3.5 w-3.5 text-zinc-400" />
                Technologies & Tags
              </label>

              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="e.g. react, nextjs, mongodb"
                  className="text-xs"
                />

                <select
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 text-xs text-zinc-200"
                >
                  {COLOR_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddTag}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Tag
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
                {formTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-800 border border-zinc-700 text-zinc-200"
                  >
                    <span>#{tag.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag.name)}
                      className="hover:text-red-400 text-zinc-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Homepage Toggle in Modal */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div>
                <p className="text-xs font-semibold text-zinc-200">Show on Live Homepage</p>
                <p className="text-[11px] text-zinc-500">
                  Feature this project prominently on the portfolio landing page.
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
                  : editingProject
                  ? "Update Project"
                  : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project"
        itemName={deletingProject?.name}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
