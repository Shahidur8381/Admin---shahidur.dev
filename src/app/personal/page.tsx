"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePortfolioApi } from "@/hooks/usePortfolioApi";
import { useAuth } from "@/context/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Briefcase,
  Sparkles,
  Plus,
  X,
  Save,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  UploadCloud,
  Link2,
  Trash2,
  FileCheck,
  FileText,
  ExternalLink,
} from "lucide-react";
import { PersonalInfo } from "@/types/portfolio";

export default function PersonalPage() {
  const { portfolioData, api, mutatePortfolio, isLoading } = usePortfolioApi();
  const { triggerTotpAlert, isTotpValid, isGuest } = useAuth();

  const [formData, setFormData] = useState<PersonalInfo>({
    name: "",
    title: "",
    email: "",
    salam: "Assalamu Alaikum",
    salamMeaning: "(peace be upon you)",
    roles: [],
    aboutIntro: "",
    portrait: "",
    resumeUrl: "",
  });

  const [newRoleInput, setNewRoleInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isDraggingResume, setIsDraggingResume] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  // Sync data when loaded
  useEffect(() => {
    if (portfolioData?.personal) {
      setFormData({
        name: portfolioData.personal.name || "",
        title: portfolioData.personal.title || "",
        email: portfolioData.personal.email || "",
        salam: portfolioData.personal.salam || "Assalamu Alaikum",
        salamMeaning: portfolioData.personal.salamMeaning || "(peace be upon you)",
        roles: Array.isArray(portfolioData.personal.roles) ? portfolioData.personal.roles : [],
        aboutIntro: portfolioData.personal.aboutIntro || "",
        portrait: portfolioData.personal.portrait || "",
        resumeUrl: portfolioData.personal.resumeUrl || "",
      });
    }
  }, [portfolioData]);

  const handleAddRole = () => {
    const trimmed = newRoleInput.trim();
    if (!trimmed) return;
    if (formData.roles.includes(trimmed)) {
      toast.warning("Role already in list");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      roles: [...prev.roles, trimmed],
    }));
    setNewRoleInput("");
  };

  const handleRemoveRole = (roleToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r !== roleToRemove),
    }));
  };

  const handleKeyDownRole = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddRole();
    }
  };

  // Base64 file upload handler
  const handleFileUpload = (file: File) => {
    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Uploading images is disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP, etc.)");
      return;
    }

    // Check auth session exists before attempting upload
    if (!isTotpValid) {
      triggerTotpAlert("An active admin session is required to upload images. Please log in.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setIsUploading(true);

      try {
        const res = await api.uploadImage(base64Data, file.name || "portrait.jpg");
        if (res && res.url) {
          setFormData((prev) => ({ ...prev, portrait: res.url }));
          toast.success("Portrait photo uploaded successfully!", {
            description: "Click 'Save Changes' to commit the update to your live profile.",
          });
        } else {
          toast.error("Upload response did not return a valid image URL.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload portrait image";
        if (msg.includes("TOTP")) {
          triggerTotpAlert();
        } else {
          toast.error("Upload Failed", { description: msg });
        }
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read image file.");
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    // Reset file input value so same file can be re-selected if needed
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Base64 PDF Resume/CV upload handler with strict validation
  const handleResumeFileUpload = (file: File) => {
    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Uploading resume is disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    // Client-side PDF validation: MIME type application/pdf and .pdf extension
    const isPdfExt = file.name.toLowerCase().endsWith(".pdf");
    const isPdfMime = file.type === "application/pdf" || file.type === "";

    if (!isPdfExt || (file.type && file.type !== "application/pdf")) {
      toast.error("Invalid file format", {
        description: "Please upload a valid PDF document (.pdf). Images, videos, and other file types are not allowed.",
      });
      return;
    }

    // Check auth session exists before attempting upload
    if (!isTotpValid) {
      triggerTotpAlert("An active admin session is required to upload files. Please log in.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setIsUploadingResume(true);

      try {
        const res = await api.uploadFile(base64Data, file.name || "resume.pdf");
        if (res && res.url) {
          setFormData((prev) => ({ ...prev, resumeUrl: res.url }));
          toast.success("Resume/CV uploaded successfully!", {
            description: "Click 'Save Changes' to commit the update to your live profile.",
          });
        } else {
          toast.error("Upload response did not return a valid resume URL.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to upload resume";
        if (msg.includes("TOTP")) {
          triggerTotpAlert();
        } else {
          toast.error("Upload Failed", { description: msg });
        }
      } finally {
        setIsUploadingResume(false);
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read resume PDF file.");
    };

    reader.readAsDataURL(file);
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleResumeFileUpload(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleResumeDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(true);
  };

  const handleResumeDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
  };

  const handleResumeDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleResumeFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      toast.error("Guest View (Read-Only)", {
        description: "Modifications are disabled in Guest Mode. Please log in as Admin.",
      });
      return;
    }

    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required fields.");
      return;
    }

    setIsSaving(true);
    try {
      await api.updatePersonal(formData);
      toast.success("Personal information updated successfully!", {
        description: "Portrait and profile changes are now live on your portfolio.",
      });
      mutatePortfolio();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update personal info";
      if (msg.includes("TOTP")) {
        triggerTotpAlert();
      } else {
        toast.error("Update Failed", { description: msg });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <User className="h-6 w-6 text-indigo-400" />
            Personal Info Manager
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Update your identity, portrait photograph, resume/CV, greeting, rotating roles, and introduction bio.
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSaving || isLoading || isUploading || isUploadingResume || isGuest}
          className="gap-2 shadow-lg shadow-indigo-500/25 self-start sm:self-auto disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? "Saving to Backend..." : isGuest ? "Read-Only Mode" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Portrait & Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dedicated Portrait Photo Card */}
          <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
            <CardHeader className="border-b border-zinc-800/80 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-indigo-400" />
                  Portrait Photo Management
                </CardTitle>
                <Badge variant="purple" className="text-[10px]">
                  Header & Hero Avatar
                </Badge>
              </div>
              <CardDescription>
                Upload an image directly (Base64 POST to /admin/upload) or specify an image URL.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
              {/* Visual Preview + Quick Controls */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-indigo-500/40 shrink-0 flex items-center justify-center shadow-lg group">
                  {formData.portrait ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={formData.portrait}
                      alt="Portrait Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <User className="h-10 w-10 text-zinc-600" />
                  )}

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-indigo-400">
                      <RefreshCw className="h-6 w-6 animate-spin mb-1" />
                      <span className="text-[9px] font-mono text-zinc-300">Uploading</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-semibold text-white">Current Portrait</span>
                    {formData.portrait ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">
                        Placeholder
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono break-all line-clamp-2">
                    {formData.portrait || "No portrait URL set."}
                  </p>

                  {formData.portrait && (
                    <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, portrait: "" })}
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Photo
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Method A: File Upload / Drag & Drop Area */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="h-3.5 w-3.5 text-indigo-400" />
                    Option 1: Upload Image File (Base64)
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    Supported: JPG, PNG, WebP, GIF
                  </span>
                </label>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-950/20 scale-[0.99]"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="p-3 rounded-full bg-zinc-800/80 text-indigo-400 mb-2 border border-zinc-700/60 shadow-inner">
                    {isUploading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">
                    {isUploading
                      ? "Converting & Uploading to Backend..."
                      : "Click to browse or drag and drop image here"}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Sends <code className="text-indigo-300">POST /api/admin/upload</code> with your TOTP code
                  </p>
                </div>
              </div>

              {/* Method B: Direct URL Input Field */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-indigo-400" />
                  Option 2: Direct Portrait Image URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.portrait}
                    onChange={(e) => setFormData({ ...formData, portrait: e.target.value })}
                    placeholder="https://... or /images/portrait.jpg"
                    className="text-xs font-mono"
                  />
                  {formData.portrait && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, portrait: "" })}
                      className="shrink-0 text-xs px-2.5"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  You can paste an external URL directly from Cloudinary, Imgur, or a local public path.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dedicated Resume / CV Management Card */}
          <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
            <CardHeader className="border-b border-zinc-800/80 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  Resume / CV Management
                </CardTitle>
                <Badge variant="purple" className="text-[10px]">
                  PDF Document
                </Badge>
              </div>
              <CardDescription>
                Upload a PDF resume/CV directly (Base64 POST to /admin/upload) or specify a direct document URL.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-5">
              {/* Visual Preview / Existing Resume Status */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow">
                  {isUploadingResume ? (
                    <RefreshCw className="h-6 w-6 animate-spin text-indigo-400" />
                  ) : (
                    <FileText className="h-6 w-6 text-indigo-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-sm font-semibold text-white">Current Resume / CV</span>
                    {formData.resumeUrl ? (
                      <Badge variant="success" className="text-[10px] gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Configured
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">
                        Not Set
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-mono break-all line-clamp-2">
                    {formData.resumeUrl || "No resume URL set."}
                  </p>

                  {formData.resumeUrl && (
                    <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <a
                        href={formData.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open / View PDF
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, resumeUrl: "" })}
                        className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove URL
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Method A: Upload PDF File (Base64) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="h-3.5 w-3.5 text-indigo-400" />
                    Option 1: Upload PDF File (Base64)
                  </span>
                  <span className="text-[11px] text-zinc-500 font-normal">
                    Supported: .pdf only
                  </span>
                </label>

                <input
                  type="file"
                  ref={resumeFileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleResumeFileChange}
                  className="hidden"
                />

                <div
                  onDragOver={handleResumeDragOver}
                  onDragLeave={handleResumeDragLeave}
                  onDrop={handleResumeDrop}
                  onClick={() => resumeFileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                    isDraggingResume
                      ? "border-indigo-500 bg-indigo-950/20 scale-[0.99]"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-900/50"
                  }`}
                >
                  <div className="p-3 rounded-full bg-zinc-800/80 text-indigo-400 mb-2 border border-zinc-700/60 shadow-inner">
                    {isUploadingResume ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <UploadCloud className="h-5 w-5" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-200">
                    {isUploadingResume
                      ? "Converting & Uploading PDF to Backend..."
                      : formData.resumeUrl
                      ? "Click or drag and drop to replace existing PDF"
                      : "Click to browse or drag and drop PDF here"}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Sends <code className="text-indigo-300">POST /api/admin/upload</code> with your TOTP code
                  </p>
                </div>
              </div>

              {/* Method B: Direct URL Input Field */}
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Link2 className="h-3.5 w-3.5 text-indigo-400" />
                  Option 2: Direct Resume / CV URL
                </label>
                <div className="flex gap-2">
                  <Input
                    value={formData.resumeUrl || ""}
                    onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                    placeholder="https://api.shahidur.dev/uploads/resume.pdf"
                    className="text-xs font-mono"
                  />
                  {formData.resumeUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ ...formData, resumeUrl: "" })}
                      className="shrink-0 text-xs px-2.5"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500">
                  You can paste an external URL from Google Drive, GitHub raw, Cloudinary, or custom CDN.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Core Profile Details Card */}
          <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl">
            <CardHeader className="border-b border-zinc-800/80 pb-4">
              <CardTitle className="text-base">Core Profile Details</CardTitle>
              <CardDescription>
                Essential information displayed on the hero and footer sections.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Full Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Shahidur Rahman"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Professional Title *</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. 3D Developer & Engineer"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-zinc-400" />
                    Public Contact Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. hello@shahidur.dev"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Salam / Greeting</label>
                    <Input
                      value={formData.salam}
                      onChange={(e) => setFormData({ ...formData, salam: e.target.value })}
                      placeholder="Assalamu Alaikum"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Greeting Meaning</label>
                    <Input
                      value={formData.salamMeaning}
                      onChange={(e) => setFormData({ ...formData, salamMeaning: e.target.value })}
                      placeholder="(peace be upon you)"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">About Intro Bio</label>
                  <Textarea
                    rows={4}
                    value={formData.aboutIntro}
                    onChange={(e) => setFormData({ ...formData, aboutIntro: e.target.value })}
                    placeholder="Brief intro highlighting your skills and mission..."
                    className="leading-relaxed text-sm"
                  />
                </div>

                {/* Roles Manager */}
                <div className="space-y-3 pt-2 border-t border-zinc-800/80">
                  <label className="text-xs font-medium text-zinc-300 block">
                    Rotating Roles Array
                  </label>

                  <div className="flex gap-2">
                    <Input
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={handleKeyDownRole}
                      placeholder="Add role (e.g. A Tech Innovator)"
                      className="text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddRole}
                      className="shrink-0"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1 min-h-[36px]">
                    {formData.roles.length === 0 ? (
                      <span className="text-xs text-zinc-500 italic">No roles configured.</span>
                    ) : (
                      formData.roles.map((role, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
                        >
                          <span>{role}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(role)}
                            className="hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-xl sticky top-24">
            <CardHeader className="border-b border-zinc-800/80 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  Live Hero Preview
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-zinc-400">
                  Client View
                </Badge>
              </div>
              <CardDescription>
                Real-time rendering of your hero bio on the portfolio website.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Preview Card */}
              <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-indigo-500/40 shrink-0 flex items-center justify-center shadow-lg">
                    {formData.portrait ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={formData.portrait}
                        alt="Portrait"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <User className="h-10 w-10 text-zinc-500" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <p className="text-xs text-indigo-400 font-medium">
                      {formData.salam}{" "}
                      <span className="text-zinc-500 font-normal">{formData.salamMeaning}</span>
                    </p>
                    <h3 className="text-lg font-bold text-white tracking-tight truncate">
                      {formData.name || "Your Name"}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">
                      {formData.title || "Your Title"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/80 space-y-2">
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                    Rotating Roles:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.roles.length === 0 ? (
                      <span className="text-xs text-zinc-600 italic">No roles added yet</span>
                    ) : (
                      formData.roles.map((r, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/60"
                        >
                          {r}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-800/80">
                  <p className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                    About Intro:
                  </p>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{formData.aboutIntro || "Your introduction bio will appear here..."}"
                  </p>
                </div>

                <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Contact: {formData.email || "hello@example.com"}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                </div>

                {formData.resumeUrl && (
                  <div className="mt-3 pt-3 flex items-center justify-between text-[11px] border-t border-zinc-800/80">
                    <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                      <FileCheck className="h-3.5 w-3.5" /> Resume / CV Attached
                    </span>
                    <a
                      href={formData.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-mono flex items-center gap-1"
                    >
                      <span>View PDF</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-zinc-950/70 border border-zinc-800/80 p-4 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  REST API Endpoints
                </div>
                <div className="space-y-1 font-mono text-[11px] text-zinc-500">
                  <p>POST /api/admin/upload (Base64 file/image upload)</p>
                  <p>PUT /api/admin/personal (Profile & resume update)</p>
                </div>
                <p className="text-[11px] text-zinc-500 leading-normal">
                  All updates automatically include your active 6-digit TOTP key header.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
