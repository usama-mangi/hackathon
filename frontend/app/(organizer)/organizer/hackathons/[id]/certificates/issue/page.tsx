"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Award, 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  Users, 
  ShieldCheck 
} from "lucide-react";
import { api } from "@/src/lib/api";

interface IssueResponse {
  issued: number;
  skipped: number;
  certificates: any[];
}

export default function IssueCertificatesTriggerPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IssueResponse | null>(null);

  useEffect(() => {
    let active = true;

    const triggerIssue = async () => {
      try {
        const response = await api(`/hackathon/${id}/certificates/issue`, {
          method: "POST",
        });
        if (active) {
          setResult(response);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Bulk certificate issue failed:", err);
        if (active) {
          setError(err?.message || "An unexpected error occurred while issuing certificates.");
          setLoading(false);
        }
      }
    };

    triggerIssue();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="max-w-xl mx-auto space-y-6 font-body pt-8">
      {/* Back Link */}
      <div>
        <Link
          href={`/organizer/hackathons/${id}/certificates`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Certificates
        </Link>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl shadow-sm text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary-container/10 text-primary flex items-center justify-center">
          <Award className={`h-8 w-8 ${loading ? "animate-bounce" : ""}`} />
        </div>

        {loading && (
          <div className="space-y-4">
            <h1 className="font-display font-bold text-xl text-on-surface">Generating Certificates</h1>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              Epoch is compiling placements, verifying participant attendance, mentor validations, and signing tamper-proof digital certificates. Please do not close this window...
            </p>
            <div className="flex items-center justify-center gap-2 text-primary text-xs font-semibold pt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating cryptographic tokens...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <h1 className="font-display font-bold text-xl text-status-error flex items-center justify-center gap-1.5">
              <AlertCircle className="h-6 w-6" /> Issuance Failed
            </h1>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto leading-relaxed bg-status-error/5 p-4 border border-status-error/15 rounded-xl text-left">
              {error}
            </p>
            <div className="pt-4 border-t border-outline-variant/60 flex gap-3">
              <Link
                href={`/organizer/hackathons/${id}/certificates`}
                className="flex-1 py-2 text-center border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-semibold text-on-surface transition-all"
              >
                Back to Registry
              </Link>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  setResult(null);
                  router.refresh();
                }}
                className="flex-1 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:opacity-95 transition-all shadow-sm"
              >
                Retry Operation
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="font-display font-bold text-xl text-status-success flex items-center justify-center gap-1.5">
                <CheckCircle className="h-6 w-6" /> Operation Complete!
              </h1>
              <p className="text-xs text-on-surface-variant max-w-xs mx-auto leading-relaxed">
                Digital credentials have been successfully issued and cataloged in the Epoch database.
              </p>
            </div>

            {/* Results breakdown */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-2">
              <div className="bg-surface p-4 rounded-xl border border-outline-variant flex flex-col items-center justify-center shadow-xs">
                <span className="text-2xl font-bold text-primary font-mono">{result.issued}</span>
                <span className="text-[10px] uppercase font-bold text-outline tracking-wider mt-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" /> Newly Issued
                </span>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-outline-variant flex flex-col items-center justify-center shadow-xs">
                <span className="text-2xl font-bold text-on-surface-variant font-mono">{result.skipped}</span>
                <span className="text-[10px] uppercase font-bold text-outline tracking-wider mt-1.5 flex items-center gap-1">
                  <Users className="h-3 w-3 text-outline" /> Already Issued
                </span>
              </div>
            </div>

            <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-3 max-w-md mx-auto flex items-center justify-center gap-1.5 text-[11px] text-status-success">
              <ShieldCheck className="h-4 w-4" /> Cryptographic signatures generated successfully
            </div>

            <div className="pt-6 border-t border-outline-variant/60">
              <Link
                href={`/organizer/hackathons/${id}/certificates`}
                className="inline-flex items-center justify-center w-full py-2.5 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:opacity-95 transition-all shadow-sm"
              >
                Return to Certificates Registry
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
