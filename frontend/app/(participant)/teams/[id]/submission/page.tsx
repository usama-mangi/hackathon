"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { z } from "zod";
import {
  FileText,
  GitBranch,
  Globe,
  Video,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  Save,
  Info,
  X,
} from "lucide-react";

const MAX_UPDATES = 5;
const AUTOSAVE_DELAY = 2500;

const schema = z.object({
  title: z.string().min(1, "Project title is required").max(120, "Title too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(3000, "Description too long"),
  repoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  demoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  videoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type FormData = {
  title: string;
  description: string;
  repoUrl: string;
  demoUrl: string;
  videoUrl: string;
};

type SaveState = "idle" | "saving" | "saved" | "error";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-status-error mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3 shrink-0" />
      {msg}
    </p>
  );
}

// Modal for last-save warning
function LastSaveModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-status-error/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-status-error" />
          </div>
          <div>
            <h3 className="font-display font-bold text-on-surface">Final Update Warning</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              This is your <strong>last remaining update</strong>. After saving, you won&apos;t be able to modify your submission again. Are you sure?
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-status-error text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Save Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionBuilderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    repoUrl: "",
    demoUrl: "",
    videoUrl: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [hasExisting, setHasExisting] = useState(false);
  const [updatesRemaining, setUpdatesRemaining] = useState<number>(MAX_UPDATES);
  const [loading, setLoading] = useState(true);
  const [showLastSaveModal, setShowLastSaveModal] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) loadSubmission();
  }, [session, isPending]);

  async function loadSubmission() {
    try {
      const team = await api(`/teams/${params.id}`);
      if (team?.submission) {
        const s = team.submission;
        setForm({
          title: s.title || "",
          description: s.description || "",
          repoUrl: s.repoUrl || "",
          demoUrl: s.demoUrl || "",
          videoUrl: s.videoUrl || "",
        });
        setHasExisting(true);
        setUpdatesRemaining(typeof s.submissionUpdates === "number" ? s.submissionUpdates : MAX_UPDATES);
      }
    } catch (err: any) {
      setServerError(err.message || "Failed to load submission");
    } finally {
      setLoading(false);
    }
  }

  const set = (key: keyof FormData) => (v: string) => {
    setForm((prev) => ({ ...prev, [key]: v }));
    // Trigger autosave
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      doAutoSave({ ...form, [key]: v });
    }, AUTOSAVE_DELAY);
  };

  const doAutoSave = useCallback(
    async (data: FormData) => {
      const result = schema.safeParse(data);
      if (!result.success) return; // Don't autosave invalid data
      await doSave(data, true);
    },
    [hasExisting, updatesRemaining, params.id]
  );

  async function doSave(data: FormData, isAutoSave = false) {
    if (updatesRemaining <= 0 && hasExisting) {
      if (!isAutoSave) setServerError("No updates remaining.");
      return;
    }

    setSaveState("saving");
    setServerError(null);
    try {
      const payload: Record<string, any> = {
        title: data.title,
        description: data.description,
      };
      if (data.repoUrl) payload.repoUrl = data.repoUrl;
      if (data.demoUrl) payload.demoUrl = data.demoUrl;
      if (data.videoUrl) payload.videoUrl = data.videoUrl;

      const method = hasExisting ? "PUT" : "POST";
      const result = await api(`/teams/${params.id}/submission`, {
        method,
        body: JSON.stringify(payload),
      });
      setHasExisting(true);
      if (typeof result?.submissionUpdates === "number") {
        setUpdatesRemaining(result.submissionUpdates);
      } else if (hasExisting) {
        setUpdatesRemaining((prev) => Math.max(0, prev - 1));
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err: any) {
      setServerError(err.message || "Failed to save submission");
      setSaveState("error");
    }
  }

  function handleManualSave(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(form);
    if (!result.success) {
      const errs: typeof errors = {};
      result.error.issues.forEach((e) => { errs[e.path[0] as keyof FormData] = e.message; });
      setErrors(errs);
      return;
    }
    setErrors({});

    if (hasExisting && updatesRemaining === 1) {
      setShowLastSaveModal(true);
      setPendingSave(true);
      return;
    }
    doSave(form);
  }

  function confirmLastSave() {
    setShowLastSaveModal(false);
    setPendingSave(false);
    doSave(form);
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const descLength = form.description.length;
  const isLocked = hasExisting && updatesRemaining <= 0;

  return (
    <>
      {showLastSaveModal && (
        <LastSaveModal
          onConfirm={confirmLastSave}
          onCancel={() => { setShowLastSaveModal(false); setPendingSave(false); }}
        />
      )}
      <div className="max-w-2xl mx-auto py-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6">
          <button onClick={() => router.back()} className="hover:text-primary transition-colors flex items-center gap-1">
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Team
          </button>
          <span>/</span>
          <span>Submission</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
              {hasExisting ? "Update Submission" : "Create Submission"}
            </h1>
            <p className="text-sm text-on-surface-variant">
              Build your project submission for the hackathon.
            </p>
          </div>

          {/* Update counter + save state */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border ${
              isLocked
                ? "bg-status-error/10 border-status-error/20 text-status-error"
                : updatesRemaining <= 2
                ? "bg-status-warning/10 border-status-warning/20 text-status-warning"
                : "bg-surface-container border-outline-variant text-on-surface-variant"
            }`}>
              <Save className="h-3 w-3" />
              {hasExisting ? `${updatesRemaining}/${MAX_UPDATES} updates left` : "New"}
            </div>

            {saveState === "saving" && (
              <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                <Loader2 className="h-3 w-3 animate-spin" /> Saving…
              </span>
            )}
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-xs text-status-success">
                <CheckCircle className="h-3 w-3" /> Saved
              </span>
            )}
            {saveState === "error" && (
              <span className="flex items-center gap-1 text-xs text-status-error">
                <AlertCircle className="h-3 w-3" /> Error
              </span>
            )}
          </div>
        </div>

        {/* Locked warning */}
        {isLocked && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-status-error/10 border border-status-error/20 mb-5">
            <AlertCircle className="h-4 w-4 text-status-error mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-status-error">Submission Locked</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                You have used all 5 allowed updates. Your submission is now final.
              </p>
            </div>
          </div>
        )}

        {/* Server error */}
        {serverError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm mb-5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{serverError}</span>
            <button onClick={() => setServerError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleManualSave} className="space-y-5">
          {/* Project Title */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-5">
            <h3 className="font-display font-semibold text-on-surface">Project Details</h3>

            <div>
              <label htmlFor="proj-title" className="block text-sm font-medium text-on-surface mb-1.5">
                Project Title <span className="text-status-error">*</span>
              </label>
              <input
                id="proj-title"
                type="text"
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="e.g. EcoTrack — Real-time Carbon Footprint Monitor"
                maxLength={120}
                disabled={isLocked}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50 disabled:cursor-not-allowed ${errors.title ? "border-status-error" : "border-outline-variant focus:border-primary/50"}`}
              />
              <div className="flex justify-between mt-1">
                <FieldError msg={errors.title} />
                <span className="text-[10px] font-mono text-outline ml-auto">{form.title.length}/120</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="proj-description" className="block text-sm font-medium text-on-surface mb-1.5">
                Project Description <span className="text-status-error">*</span>
              </label>
              <textarea
                id="proj-description"
                rows={7}
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Describe your project, its goals, technical approach, and impact…"
                maxLength={3000}
                disabled={isLocked}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50 disabled:cursor-not-allowed ${errors.description ? "border-status-error" : "border-outline-variant focus:border-primary/50"}`}
              />
              <div className="flex items-center justify-between mt-1">
                <FieldError msg={errors.description} />
                <span className={`ml-auto text-[10px] font-mono ${descLength > 2700 ? "text-status-warning" : "text-outline"}`}>
                  {descLength}/3000
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-5">
            <h3 className="font-display font-semibold text-on-surface">Project Links</h3>

            {[
              { id: "repo-url", key: "repoUrl" as const, label: "Repository URL", Icon: GitBranch, placeholder: "https://github.com/yourname/your-repo" },
              { id: "demo-url", key: "demoUrl" as const, label: "Live Demo URL", Icon: Globe, placeholder: "https://your-demo.vercel.app" },
              { id: "video-url", key: "videoUrl" as const, label: "Demo Video URL", Icon: Video, placeholder: "https://youtube.com/watch?v=…" },
            ].map(({ id, key, label, Icon, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="text-sm font-medium text-on-surface mb-1.5 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5 text-outline" />
                  {label}
                  <span className="text-[10px] font-mono text-on-surface-variant ml-1">optional</span>
                </label>
                <input
                  id={id}
                  type="url"
                  value={form[key]}
                  onChange={(e) => set(key)(e.target.value)}
                  placeholder={placeholder}
                  disabled={isLocked}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition disabled:opacity-50 disabled:cursor-not-allowed ${errors[key] ? "border-status-error" : "border-outline-variant focus:border-primary/50"}`}
                />
                <FieldError msg={errors[key]} />
              </div>
            ))}
          </div>

          {/* Autosave note */}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <Info className="h-3.5 w-3.5 text-outline shrink-0" />
            Changes are auto-saved after {AUTOSAVE_DELAY / 1000}s of inactivity. Manual save counts as one update.
          </div>

          <button
            id="save-submission-btn"
            type="submit"
            disabled={saveState === "saving" || isLocked}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveState === "saving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {hasExisting ? "Save Changes" : "Submit Project"}
          </button>
        </form>
      </div>
    </>
  );
}
