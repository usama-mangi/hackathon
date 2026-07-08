"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { z } from "zod";
import { ChevronLeft, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().min(1, "Team name is required").max(80, "Team name is too long"),
});

export default function CreateTeamPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hackathon, setHackathon] = useState<any>(null);
  const [roleContext, setRoleContext] = useState<any>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) {
      setLoadingRole(true);
      Promise.all([
        api(`/hackathon/${params.id}`),
        api(`/hackathon/${params.id}/me/role`)
      ])
        .then(([h, rc]) => {
          setHackathon(h);
          setRoleContext(rc);
        })
        .catch((err) => {
          console.error("Error loading hackathon role status:", err);
          setError(err.message || "Failed to retrieve status context");
        })
        .finally(() => {
          setLoadingRole(false);
        });
    }
  }, [session, isPending]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const team = await api(`/hackathon/${params.id}/teams`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      router.push(`/teams/${team.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create team");
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending || (loadingRole && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isRegisteredParticipant = roleContext?.isParticipant;

  return (
    <div className="max-w-lg mx-auto py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6">
        <button onClick={() => router.back()} className="hover:text-primary transition-colors flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
        {hackathon && (
          <>
            <span>/</span>
            <span className="font-medium text-on-surface truncate">{hackathon.name}</span>
            <span>/</span>
            <span>Create Team</span>
          </>
        )}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-4">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">
          Create a Team
        </h1>
        <p className="text-sm text-on-surface-variant">
          Start your journey{hackathon ? ` in ${hackathon.name}` : ""}. You&apos;ll become the team leader automatically.
        </p>
      </div>

      {/* Check if user has joined this hackathon */}
      {!isRegisteredParticipant ? (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-center items-center py-10">
          <AlertCircle className="h-10 w-10 text-status-warning" />
          <div>
            <h3 className="font-display font-bold text-lg text-on-surface">Registration Required</h3>
            <p className="text-sm text-on-surface-variant mt-1.5 max-w-sm">
              You must register for this hackathon before creating a team.
            </p>
          </div>
          <button
            onClick={() => router.push(`/hackathon/${params.id}/join`)}
            className="px-6 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity mt-2"
          >
            Register for Hackathon
          </button>
        </div>
      ) : (
        /* Form Card */
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="team-name" className="block text-sm font-medium text-on-surface mb-1.5">
                Team Name
              </label>
              <input
                id="team-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NeuralNinjas"
                maxLength={80}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                  error ? "border-status-error" : "border-outline-variant focus:border-primary/50"
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono text-outline ml-auto">{name.length}/80</span>
              </div>
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant">
              <CheckCircle className="h-4 w-4 text-status-success mt-0.5 shrink-0" />
              <div className="text-xs text-on-surface-variant space-y-1">
                <p>You will be set as the <strong className="text-on-surface">Team Leader</strong>.</p>
                <p>After creation, share your invite code with teammates so they can join.</p>
              </div>
            </div>

            <button
              id="create-team-btn"
              type="submit"
              disabled={submitting || !name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              Create Team
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
