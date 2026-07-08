"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Trophy, ArrowLeft, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { api } from "@/src/lib/api";

interface Hackathon {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

interface EditHackathonClientProps {
  hackathon: Hackathon;
}

const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const editSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description cannot exceed 1000 characters"),
  startsAt: z.string(),
  endsAt: z.string(),
  isActive: z.boolean(),
}).refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "End date must be after the start date",
  path: ["endsAt"],
});

export default function EditHackathonClient({ hackathon }: EditHackathonClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initialStarts = formatDateForInput(hackathon.startsAt);
  const initialEnds = formatDateForInput(hackathon.endsAt);

  const [form, setForm] = useState({
    name: hackathon.name,
    description: hackathon.description || "",
    startsAt: initialStarts,
    endsAt: initialEnds,
    isActive: hackathon.isActive,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setForm(prev => ({ ...prev, [name]: val }));
  };

  const validateForm = () => {
    const result = editSchema.safeParse(form);
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
    setSubmitError(null);

    // Build delta payload to send only modified fields
    const payload: any = {};
    
    if (form.name !== hackathon.name) payload.name = form.name;
    if (form.description !== (hackathon.description || "")) payload.description = form.description;
    if (form.isActive !== hackathon.isActive) payload.isActive = form.isActive;

    if (form.startsAt !== initialStarts) {
      const startsDate = new Date(form.startsAt);
      if (startsDate <= new Date()) {
        setSubmitError("New start date must be in the future");
        setSubmitting(false);
        return;
      }
      payload.startsAt = startsDate.toISOString();
    }

    if (form.endsAt !== initialEnds) {
      const endsDate = new Date(form.endsAt);
      if (endsDate <= new Date()) {
        setSubmitError("New end date must be in the future");
        setSubmitting(false);
        return;
      }
      payload.endsAt = endsDate.toISOString();
    }

    if (Object.keys(payload).length === 0) {
      router.push("/organizer/hackathons");
      return;
    }

    try {
      await api(`/hackathon/${hackathon.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      router.push("/organizer/hackathons");
      router.refresh();
    } catch (err: any) {
      console.error("Update hackathon failed:", err);
      setSubmitError(err?.message || "Failed to update hackathon settings.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 font-body">
      <div>
        <Link
          href="/organizer/hackathons"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-outline-variant/65 pb-4">
          <div className="w-10 h-10 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-on-surface">
              Edit Hackathon Settings
            </h1>
            <p className="text-xs text-on-surface-variant">Update details for {hackathon.name}</p>
          </div>
        </div>

        {submitError && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Hackathon Name */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold text-on-surface">
              Hackathon Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="e.g. Epoch Global Hackathon 2026"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                errors.name ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-status-error font-medium">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-on-surface">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide event details..."
              value={form.description}
              onChange={handleChange}
              className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                errors.description ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
              }`}
            />
            {errors.description && (
              <p className="text-xs text-status-error font-medium">{errors.description}</p>
            )}
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Starts At */}
            <div className="space-y-1.5">
              <label htmlFor="startsAt" className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-outline" />
                Starts At
              </label>
              <input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.startsAt ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.startsAt && (
                <p className="text-xs text-status-error font-medium">{errors.startsAt}</p>
              )}
            </div>

            {/* Ends At */}
            <div className="space-y-1.5">
              <label htmlFor="endsAt" className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-outline" />
                Ends At
              </label>
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.endsAt ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.endsAt && (
                <p className="text-xs text-status-error font-medium">{errors.endsAt}</p>
              )}
            </div>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2.5 pt-2">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive}
              onChange={handleChange}
              className="h-4.5 w-4.5 rounded border-outline-variant text-primary focus:ring-primary accent-primary cursor-pointer"
            />
            <label htmlFor="isActive" className="text-xs font-semibold text-on-surface cursor-pointer select-none">
              Publish Event (make it active immediately)
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-outline-variant/65">
            <Link
              href="/organizer/hackathons"
              className="flex-1 py-2.5 text-center border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-semibold text-on-surface transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:opacity-95 transition-all shadow-sm disabled:opacity-75"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
