import React from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import { CheckCircle2, Shield, Search, FileDown, AlertTriangle, Printer } from "lucide-react";
import VerifySearchForm from "@/src/components/layouts/VerifySearchForm";

export const dynamic = "force-dynamic";

interface CertificateDetail {
  id: string;
  certificateId: string;
  hackathonId: string;
  userId: string;
  recipientName: string;
  hackathonName: string;
  type: string;
  placement: number | null;
  issuedAt: string;
  hackathon: {
    id: string;
    name: string;
    startsAt: string;
    endsAt: string;
  };
  user: {
    id: string;
    name: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VerifyCertificatePage({ params }: PageProps) {
  const { id } = await params;
  const isSearchState = id === "id"; // Default fallback route

  let cert: CertificateDetail | null = null;
  let error: string | null = null;

  if (!isSearchState) {
    try {
      cert = await api(`/certificates/verify/${id}`);
    } catch (err: any) {
      console.error("Failed to verify certificate:", err);
      error = err?.message || "Certificate not found. Please verify the ID and try again.";
    }
  }

  const formatPlacement = (placement: number) => {
    switch (placement) {
      case 1: return "1st Place Winner";
      case 2: return "2nd Place Winner";
      case 3: return "3rd Place Winner";
      default: return `${placement}th Place`;
    }
  };

  return (
    <main className="flex-grow px-4 md:px-8 py-12 flex flex-col items-center max-w-4xl mx-auto w-full">
      {/* Search & Hero Header */}
      <section className="w-full max-w-[600px] mb-12 text-center">
        <h1 className="font-display font-bold text-3xl text-on-surface mb-2">Verify Certificate</h1>
        <p className="text-sm text-on-surface-variant mb-6">
          Verify the authenticity of digital certificates issued by Epoch Epoch.
        </p>
        
        {/* Search Input client form */}
        <VerifySearchForm initialValue={isSearchState ? "" : id} />
      </section>

      {/* Verification Result Card */}
      {!isSearchState && (
        <section className="w-full max-w-[640px] flex flex-col items-center">
          {error ? (
            <div className="bg-status-error/10 border border-status-error/20 text-status-error p-4 rounded-xl text-sm w-full flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : cert ? (
            <div className="w-full flex flex-col items-center">
              {/* Outer certificate card */}
              <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden relative group">
                
                {/* Verified Header Strip */}
                <div className="bg-status-success px-6 py-3 flex items-center gap-2 text-on-primary text-xs font-bold font-mono tracking-wider">
                  <CheckCircle2 className="h-4 w-4 fill-current" />
                  <span>VERIFIED ORIGINAL CERTIFICATE</span>
                </div>

                {/* Certificate Core Canvas */}
                <div className="p-8 relative">
                  {/* Metadata Header */}
                  <div className="flex justify-between items-start mb-10 text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-secondary font-mono tracking-wide text-[10px] uppercase mb-0.5">
                        Certificate ID
                      </span>
                      <span className="font-mono text-sm font-semibold text-on-surface select-all">
                        {cert.certificateId}
                      </span>
                    </div>

                    {cert.placement && (
                      <div className="bg-status-warning/15 text-status-warning px-3 py-1 rounded font-bold text-[10px] tracking-wider uppercase border border-status-warning/20">
                        {formatPlacement(cert.placement)}
                      </div>
                    )}
                  </div>

                  {/* Presentational content */}
                  <div className="text-center mb-8 relative z-10 space-y-6">
                    <h2 className="font-display font-bold text-xl text-secondary">
                      Certificate of Achievement
                    </h2>
                    
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-secondary font-mono tracking-widest uppercase">
                        PROUDLY PRESENTED TO
                      </p>
                      <h3 className="font-display font-extrabold text-2xl md:text-3xl text-on-surface tracking-tight">
                        {cert.recipientName}
                      </h3>
                    </div>

                    <div className="max-w-md mx-auto h-[1px] bg-outline-variant/60 my-6" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-md mx-auto pt-2 text-xs">
                      <div>
                        <span className="font-bold text-secondary font-mono tracking-wide text-[9px] uppercase block mb-0.5">
                          Role/Type
                        </span>
                        <p className="font-semibold text-on-surface">
                          {cert.type} {cert.placement ? `(${formatPlacement(cert.placement)})` : ""}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary font-mono tracking-wide text-[9px] uppercase block mb-0.5">
                          Event Hub
                        </span>
                        <p className="font-semibold text-on-surface">
                          {cert.hackathonName}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary font-mono tracking-wide text-[9px] uppercase block mb-0.5">
                          Issued Date
                        </span>
                        <p className="font-semibold text-on-surface">
                          {new Date(cert.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-secondary font-mono tracking-wide text-[9px] uppercase block mb-0.5">
                          Issuing Authority
                        </span>
                        <p className="font-semibold text-primary">
                          Epoch Epoch Systems
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Background Shield Watermark */}
                  <div className="absolute bottom-6 right-6 opacity-[0.02] pointer-events-none select-none z-0">
                    <Shield className="h-32 w-32" />
                  </div>
                </div>
              </div>

              {/* Print CTA */}
              <div className="mt-8">
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  className="px-5 py-2.5 rounded-lg border border-on-surface text-on-surface font-semibold text-xs flex items-center gap-2 hover:bg-surface-container-high transition-all"
                >
                  <Printer className="h-4 w-4" />
                  Print / Download PDF
                </button>
              </div>
            </div>
          ) : null}
        </section>
      )}
    </main>
  );
}
