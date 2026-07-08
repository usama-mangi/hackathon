"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { z } from "zod";
import {
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  GraduationCap,
  Scale,
} from "lucide-react";

// ── Zod Schemas ──────────────────────────────────────────────────────────────
const baseSchema = z.object({
  roleType: z.enum(["MENTOR", "JUDGE"]),
  bio: z.string().min(30, "Bio must be at least 30 characters").max(500),
  motivation: z.string().min(50, "Motivation must be at least 50 characters").max(1000),
  experience: z.string().min(50, "Experience must be at least 50 characters").max(1000),
});

const mentorSchema = baseSchema.extend({
  roleType: z.literal("MENTOR"),
  skills: z.string().max(300).optional(),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  availability: z.string().max(300).optional(),
});

const judgeSchema = baseSchema.extend({
  roleType: z.literal("JUDGE"),
  expertiseArea: z.string().max(300).optional(),
  priorJudgingExp: z.string().max(1000).optional(),
  conflictStatement: z.string().max(1000).optional(),
});

type FormData = {
  roleType: "MENTOR" | "JUDGE";
  bio: string;
  motivation: string;
  experience: string;
  skills: string;
  linkedinUrl: string;
  githubUrl: string;
  availability: string;
  expertiseArea: string;
  priorJudgingExp: string;
  conflictStatement: string;
};

const defaultForm: FormData = {
  roleType: "MENTOR",
  bio: "",
  motivation: "",
  experience: "",
  skills: "",
  linkedinUrl: "",
  githubUrl: "",
  availability: "",
  expertiseArea: "",
  priorJudgingExp: "",
  conflictStatement: "",
};

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-status-error mt-1">{msg}</p>;
}

function Textarea({
  id,
  label,
  value,
  onChange,
  minLength,
  maxLength,
  error,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  minLength?: number;
  maxLength?: number;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-on-surface mb-1.5">
        {label}
        {minLength && (
          <span className="ml-1 text-[10px] font-mono text-on-surface-variant">
            (min {minLength})
          </span>
        )}
      </label>
      <textarea
        id={id}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
          error ? "border-status-error" : "border-outline-variant focus:border-primary/50"
        }`}
      />
      <div className="flex items-center justify-between mt-1">
        <FieldError msg={error} />
        {maxLength && (
          <span className="ml-auto text-[10px] font-mono text-outline">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-on-surface mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
          error ? "border-status-error" : "border-outline-variant focus:border-primary/50"
        }`}
      />
      <FieldError msg={error} />
    </div>
  );
}

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [hackathon, setHackathon] = useState<any>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
    } else if (session) {
      api(`/hackathon/${params.id}`).then(setHackathon).catch(() => {});
    }
  }, [session, isPending]);

  const set = (key: keyof FormData) => (v: string) =>
    setForm((prev) => ({ ...prev, [key]: v }));

  function validateStep1() {
    const errs: typeof errors = {};
    if (!form.roleType) errs.roleType = "Select a role";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function validateStep2() {
    const schema = form.roleType === "MENTOR" ? mentorSchema : judgeSchema;
    const result = schema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const errs: typeof errors = {};
    result.error.issues.forEach((e) => {
      const field = e.path[0] as keyof FormData;
      errs[field] = e.message;
    });
    setErrors(errs);
    return false;
  }

  function handleNext() {
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep2()) return;

    setSubmitting(true);
    setServerError(null);

    const payload: Record<string, any> = {
      roleType: form.roleType,
      bio: form.bio,
      motivation: form.motivation,
      experience: form.experience,
    };

    if (form.roleType === "MENTOR") {
      if (form.skills) payload.skills = form.skills;
      if (form.linkedinUrl) payload.linkedinUrl = form.linkedinUrl;
      if (form.githubUrl) payload.githubUrl = form.githubUrl;
      if (form.availability) payload.availability = form.availability;
    } else {
      if (form.expertiseArea) payload.expertiseArea = form.expertiseArea;
      if (form.priorJudgingExp) payload.priorJudgingExp = form.priorJudgingExp;
      if (form.conflictStatement) payload.conflictStatement = form.conflictStatement;
    }

    try {
      await api(`/hackathon/${params.id}/applications`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || "Failed to submit application");
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

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <CheckCircle className="h-16 w-16 text-status-success" />
        <h2 className="font-display font-bold text-2xl text-on-surface">Application Submitted!</h2>
        <p className="text-sm text-on-surface-variant max-w-sm">
          Your application as a <strong>{form.roleType}</strong> has been received. The organizers will review it shortly.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-2 px-6 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6">
        <button onClick={() => router.back()} className="hover:text-primary transition-colors flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        {hackathon && (
          <>
            <span>/</span>
            <span className="text-on-surface font-medium truncate">{hackathon.name}</span>
            <span>/</span>
            <span>Apply</span>
          </>
        )}
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">Apply to Hackathon</h1>
        <p className="text-sm text-on-surface-variant">
          Submit your application to participate as a Mentor or Judge.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map((s) => (
          <React.Fragment key={s}>
            <div className={`flex items-center gap-2 text-sm font-medium transition-colors ${step === s ? "text-primary" : step > s ? "text-status-success" : "text-on-surface-variant"}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-primary-container text-on-primary" : step > s ? "bg-status-success/15 text-status-success" : "bg-surface-container-high text-on-surface-variant"}`}>
                {step > s ? "✓" : s}
              </div>
              {s === 1 ? "Choose Role" : "Application Details"}
            </div>
            {s < 2 && <div className={`flex-1 h-px ${step > 1 ? "bg-status-success/40" : "bg-outline-variant"}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm mb-5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Step 1 — Role selection */}
      {step === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-on-surface-variant mb-2">Select the role you are applying for:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["MENTOR", "JUDGE"] as const).map((role) => {
              const Icon = role === "MENTOR" ? GraduationCap : Scale;
              const selected = form.roleType === role;
              return (
                <button
                  key={role}
                  id={`role-${role.toLowerCase()}`}
                  onClick={() => set("roleType")(role)}
                  className={`relative flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all ${
                    selected
                      ? "border-primary-container bg-primary-container/5"
                      : "border-outline-variant bg-surface-container-lowest hover:border-primary/40"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-display font-bold ${selected ? "text-primary" : "text-on-surface"}`}>
                      {role}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {role === "MENTOR"
                        ? "Guide teams with your expertise and industry experience."
                        : "Evaluate submissions and select outstanding projects."}
                    </p>
                  </div>
                  {selected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-container flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-on-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <FieldError msg={errors.roleType} />

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Application form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Common fields */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-5">
            <h3 className="font-display font-semibold text-on-surface">Common Information</h3>
            <Textarea id="bio" label="Short Bio" value={form.bio} onChange={set("bio")} minLength={30} maxLength={500} error={errors.bio} placeholder="Tell us about yourself in 30–500 characters…" />
            <Textarea id="motivation" label="Motivation" value={form.motivation} onChange={set("motivation")} minLength={50} maxLength={1000} error={errors.motivation} placeholder="Why do you want to participate as a Mentor/Judge?" />
            <Textarea id="experience" label="Relevant Experience" value={form.experience} onChange={set("experience")} minLength={50} maxLength={1000} error={errors.experience} placeholder="Describe your relevant experience…" />
          </div>

          {/* Role-specific fields */}
          {form.roleType === "MENTOR" ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-5">
              <h3 className="font-display font-semibold text-on-surface flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                Mentor Details
              </h3>
              <Input id="skills" label="Skills (comma-separated)" value={form.skills} onChange={set("skills")} placeholder="React, Node.js, Pitch Coaching" error={errors.skills} />
              <Input id="linkedinUrl" label="LinkedIn URL" value={form.linkedinUrl} onChange={set("linkedinUrl")} type="url" placeholder="https://linkedin.com/in/…" error={errors.linkedinUrl} />
              <Input id="githubUrl" label="GitHub URL" value={form.githubUrl} onChange={set("githubUrl")} type="url" placeholder="https://github.com/…" error={errors.githubUrl} />
              <Input id="availability" label="Availability" value={form.availability} onChange={set("availability")} placeholder="Full day Saturday, Sunday morning" error={errors.availability} />
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-5">
              <h3 className="font-display font-semibold text-on-surface flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Judge Details
              </h3>
              <Input id="expertiseArea" label="Area of Expertise" value={form.expertiseArea} onChange={set("expertiseArea")} placeholder="AI/ML, Hardware, Web3" error={errors.expertiseArea} />
              <Textarea id="priorJudgingExp" label="Prior Judging Experience" value={form.priorJudgingExp} onChange={set("priorJudgingExp")} maxLength={1000} error={errors.priorJudgingExp} placeholder="Describe any prior judging experience…" />
              <Textarea id="conflictStatement" label="Conflict of Interest Statement" value={form.conflictStatement} onChange={set("conflictStatement")} maxLength={1000} error={errors.conflictStatement} placeholder="Declare any potential conflicts of interest…" />
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              id="submit-application-btn"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit Application
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
