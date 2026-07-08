"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import {
  Award,
  ExternalLink,
  Download,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function CertificatesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) loadCertificates();
  }, [session, isPending]);

  async function loadCertificates() {
    try {
      const data = await api("/certificates/me");
      setCertificates(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight mb-1">
          My Certificates
        </h1>
        <p className="text-sm text-on-surface-variant">
          Recognition of your achievements across all hackathons.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {certificates.length === 0 && !error && (
        <div className="flex flex-col items-center text-center py-20 gap-4 rounded-2xl border border-dashed border-outline-variant">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
            <Award className="h-8 w-8 text-outline" />
          </div>
          <div>
            <p className="font-display font-semibold text-on-surface text-lg mb-1">
              No Certificates Yet
            </p>
            <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
              Certificates are issued after a hackathon concludes. Participate and complete a submission to earn one.
            </p>
          </div>
          <Link
            href="/hackathons"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity mt-2"
          >
            <Award className="h-4 w-4" />
            Browse Hackathons
          </Link>
        </div>
      )}

      {/* Certificate grid */}
      {certificates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certificates.map((cert: any) => (
            <div
              key={cert.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
            >
              {/* Certificate ribbon icon */}
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-status-success bg-status-success/10 border border-status-success/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  VERIFIED
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <p className="font-display font-bold text-on-surface text-base mb-0.5 leading-snug">
                  {cert.hackathon?.name || "Hackathon Certificate"}
                </p>
                {cert.issuedAt && (
                  <p className="text-xs text-on-surface-variant mb-3">
                    Issued on{" "}
                    {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                <div className="flex items-center gap-1.5 bg-surface-container rounded-lg px-3 py-2 border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant font-sans shrink-0">Certificate ID</span>
                  <code className="text-xs font-mono font-bold text-on-surface truncate">
                    {cert.publicId || cert.id?.substring(0, 16) || "—"}
                  </code>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-outline-variant">
                <a
                  href={`/certificates/verify/${cert.publicId || cert.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-surface-container border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-outline" />
                  Verify
                  <ExternalLink className="h-3 w-3 text-outline" />
                </a>
                {cert.pdfUrl && (
                  <a
                    href={cert.pdfUrl}
                    download
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
