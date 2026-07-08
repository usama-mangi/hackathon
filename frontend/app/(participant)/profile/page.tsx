"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/src/lib/auth-client";
import { z } from "zod";
import {
  User,
  Mail,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  X,
} from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = { name: string; image: string };

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [form, setForm] = useState<FormData>({ name: "", image: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session?.user) {
      setForm({
        name: session.user.name || "",
        image: session.user.image || "",
      });
    }
  }, [session, isPending]);

  const set = (key: keyof FormData) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.issues.forEach((e) => { errs[e.path[0] as keyof FormData] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setServerError(null);

    try {
      await authClient.updateUser({
        name: form.name,
        image: form.image || undefined,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setServerError(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userRole = (session?.user as any)?.role || "PARTICIPANT";
  const userEmail = session?.user?.email || "";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": return "bg-status-error/10 text-status-error border-status-error/20";
      case "ORGANIZER": return "bg-primary-container/10 text-primary border-primary-container/20";
      default: return "bg-status-success/10 text-status-success border-status-success/20";
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface mb-1">
          Profile Settings
        </h1>
        <p className="text-sm text-on-surface-variant">
          Manage your personal information and account preferences.
        </p>
      </div>

      {/* Identity card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm mb-6 flex items-center gap-4">
        {form.image ? (
          <img
            src={form.image}
            alt={form.name}
            className="w-16 h-16 rounded-full object-cover border border-outline"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-container/15 text-primary font-bold text-2xl flex items-center justify-center border border-primary-container/20">
            {form.name ? form.name.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-display font-bold text-on-surface text-lg truncate">{form.name || "Your Name"}</p>
          <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
            <Mail className="h-3 w-3" />
            {userEmail}
          </p>
          <span className={`mt-1.5 inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border ${getRoleBadge(userRole)}`}>
            {userRole}
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{serverError}</span>
              <button type="button" onClick={() => setServerError(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-status-success/10 border border-status-success/20 text-status-success text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Profile updated successfully!
            </div>
          )}

          {/* Display Name */}
          <div>
            <label htmlFor="profile-name" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-outline" />
              Display Name <span className="text-status-error">*</span>
            </label>
            <input
              id="profile-name"
              type="text"
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Your full name"
              maxLength={100}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                errors.name ? "border-status-error" : "border-outline-variant focus:border-primary/50"
              }`}
            />
            {errors.name && (
              <p className="text-xs text-status-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Avatar URL */}
          <div>
            <label htmlFor="profile-image" className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-outline" />
              Avatar URL
              <span className="text-[10px] font-mono text-on-surface-variant ml-1">optional</span>
            </label>
            <input
              id="profile-image"
              type="url"
              value={form.image}
              onChange={(e) => set("image")(e.target.value)}
              placeholder="https://avatars.githubusercontent.com/…"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                errors.image ? "border-status-error" : "border-outline-variant focus:border-primary/50"
              }`}
            />
            {errors.image && (
              <p className="text-xs text-status-error mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Read-only fields */}
          <div className="border-t border-outline-variant pt-4 space-y-4">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Read-only</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">Email Address</label>
                <div className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm text-on-surface-variant font-mono">
                  {userEmail}
                </div>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1">System Role</label>
                <div className="px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface-container text-sm font-mono font-bold text-on-surface-variant">
                  {userRole}
                </div>
              </div>
            </div>
          </div>

          <button
            id="save-profile-btn"
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
