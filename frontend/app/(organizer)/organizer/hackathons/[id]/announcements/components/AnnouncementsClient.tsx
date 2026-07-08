"use client";

import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { 
  ArrowLeft, 
  Megaphone, 
  Plus, 
  AlertCircle, 
  Clock, 
  Check 
} from "lucide-react";
import { api } from "@/src/lib/api";

interface AnnouncementItem {
  id: string;
  hackathonId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface AnnouncementsClientProps {
  hackathon: any;
  initialAnnouncements: AnnouncementItem[];
}

const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Content must be at least 10 characters"),
});

export default function AnnouncementsClient({ hackathon, initialAnnouncements }: AnnouncementsClientProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const result = announcementSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const errs: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      errs[path] = issue.message;
    });
    setErrors(errs);
    return false;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const created = await api(`/hackathon/${hackathon.id}/announcements`, {
        method: "POST",
        body: JSON.stringify(form),
      });

      if (created) {
        setAnnouncements(prev => [created, ...prev]);
        setSuccessMsg("Announcement posted successfully!");
        setForm({
          title: "",
          content: "",
        });
      }
    } catch (err: any) {
      console.error("Post announcement failed:", err);
      setError(err?.message || "Failed to post announcement.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizer/hackathons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
            Announcements Board
          </h1>
          <p className="text-xs text-on-surface-variant">
            Broadcast platform-wide updates and alert participants for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-status-success/10 border border-status-success/20 text-status-success px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (7 columns) - List of announcements */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display font-bold text-lg text-on-surface flex items-center gap-2 border-b border-outline-variant pb-2">
            <Megaphone className="h-5 w-5 text-primary" /> Posted Broadcasts ({announcements.length})
          </h2>
          
          {announcements.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant p-10 rounded-2xl text-center">
              <Megaphone className="h-10 w-10 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">No announcements posted</h3>
              <p className="text-xs text-on-surface-variant mt-1">Use the form on the right to broadcast an update to all participants in this hackathon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div 
                  key={ann.id} 
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-3 hover:border-outline transition-colors"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-on-surface text-sm">{ann.title}</h3>
                    <span className="flex items-center gap-1 text-[10px] text-on-surface-variant font-mono shrink-0">
                      <Clock className="h-3.5 w-3.5 text-outline" />
                      {new Date(ann.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side (5 columns) - Post Form */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-5">
          <h2 className="font-display font-bold text-base text-on-surface border-b border-outline-variant/70 pb-3 flex items-center gap-1.5">
            <Plus className="h-4.5 w-4.5 text-primary" />
            New Announcement
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-on-surface">
                Announcement Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Midterm Check-in & Submission Guidelines"
                value={form.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.title ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.title && (
                <p className="text-xs text-status-error font-medium">{errors.title}</p>
              )}
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label htmlFor="content" className="text-xs font-semibold text-on-surface">
                Broadcast Content
              </label>
              <textarea
                id="content"
                name="content"
                rows={6}
                placeholder="Write your announcement content here. Markdown or plain text is supported..."
                value={form.content}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.content ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.content && (
                <p className="text-xs text-status-error font-medium">{errors.content}</p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:opacity-95 transition-all shadow-sm disabled:opacity-75"
              >
                {submitting ? "Publishing..." : "Broadcast Announcement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
