"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { z } from "zod";
import {
  Hash,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

// Invite code format: XXXX-XXXX (letters + numbers)
const schema = z.object({
  inviteCode: z
    .string()
    .min(1, "Invite code is required")
    .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, "Format must be XXXX-XXXX (uppercase letters and digits)"),
});

export default function JoinTeamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
    }
  }, [session, isPending]);

  // Format input: auto-insert hyphen and uppercase
  function handleInput(raw: string) {
    const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    let formatted = cleaned;
    if (cleaned.length > 4) {
      formatted = cleaned.slice(0, 4) + "-" + cleaned.slice(4, 8);
    }
    setInviteCode(formatted);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ inviteCode });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    setServerError(null);
    try {
      await api(`/teams/${params.id}/join`, {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      });
      setSuccess(true);
      setTimeout(() => router.push(`/teams/${params.id}`), 1800);
    } catch (err: any) {
      setServerError(err.message || "Failed to join team. Check your invite code.");
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

  return (
    <div className="max-w-md mx-auto py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6">
        <button onClick={() => router.back()} className="hover:text-primary transition-colors flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <span>/</span>
        <span>Join Team</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-4">
          <Hash className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Join a Team
        </h1>
        <p className="text-sm text-on-surface-variant">
          Enter the invite code shared by your team leader to join their team.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
        {success ? (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <CheckCircle className="h-12 w-12 text-status-success" />
            <p className="font-display font-bold text-on-surface text-lg">Joined Successfully!</p>
            <p className="text-sm text-on-surface-variant">Redirecting to Team Hub…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {serverError}
              </div>
            )}

            <div>
              <label htmlFor="invite-code" className="block text-sm font-medium text-on-surface mb-1.5">
                Invite Code
              </label>
              <input
                id="invite-code"
                type="text"
                value={inviteCode}
                onChange={(e) => handleInput(e.target.value)}
                placeholder="ABCD-EFGH"
                maxLength={9}
                spellCheck={false}
                autoComplete="off"
                className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono font-bold text-on-surface bg-surface-container-lowest placeholder:text-outline tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                  error ? "border-status-error" : "border-outline-variant focus:border-primary/50"
                }`}
              />
              {error && (
                <p className="text-xs text-status-error mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              )}
              <p className="text-xs text-on-surface-variant mt-1.5">
                Format: <span className="font-mono font-bold">XXXX-XXXX</span> (uppercase letters and digits)
              </p>
            </div>

            <button
              id="join-team-btn"
              type="submit"
              disabled={submitting || inviteCode.length < 9}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Join Team
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
