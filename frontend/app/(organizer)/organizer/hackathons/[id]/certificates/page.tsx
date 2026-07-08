import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Award, 
  User, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  Trophy,
  ExternalLink
} from "lucide-react";
import { api } from "@/src/lib/api";

export const dynamic = "force-dynamic";

interface Certificate {
  id: string;
  certificateId: string;
  hackathonId: string;
  userId: string;
  recipientName: string;
  hackathonName: string;
  type: string;
  placement: number | null;
  issuedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CertificatesPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let certificates: Certificate[] = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    certificates = await api(`/hackathon/${id}/certificates`);
  } catch (error) {
    console.error(`Failed to load certificates for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="space-y-6 font-body">
      {/* Header & Back Link */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizer/hackathons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Certificates Registry
          </h1>
          <p className="text-xs text-on-surface-variant">
            View issued credentials and verify participant certificates for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
        <Link
          href={`/organizer/hackathons/${id}/certificates/issue`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          Bulk Issue Certificates
        </Link>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h2 className="font-display font-bold text-sm text-on-surface">Issued Certificates ({certificates.length})</h2>
          <span className="text-xs font-mono text-outline flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-status-success" /> Tamper-proof verification enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          {certificates.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Award className="h-12 w-12 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">No certificates issued yet</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Click "Bulk Issue Certificates" to generate digital credentials for participants, mentors, and judges.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold text-xs border-b border-outline-variant">
                  <th className="p-4 pl-6">Recipient Name</th>
                  <th className="p-4">Verification ID</th>
                  <th className="p-4">Certificate Type</th>
                  <th className="p-4 text-center">Placement</th>
                  <th className="p-4 text-right pr-6">Date Issued</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-on-surface text-sm">{cert.recipientName}</div>
                      <div className="text-xs text-on-surface-variant font-mono">{cert.user.email}</div>
                    </td>
                    <td className="p-4 font-mono text-xs text-on-surface">
                      <Link 
                        href={`/certificates/verify/${cert.certificateId}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 hover:text-primary hover:underline"
                      >
                        {cert.certificateId}
                        <ExternalLink className="h-3 w-3 text-outline" />
                      </Link>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                        cert.type === "PARTICIPANT"
                          ? "bg-primary-container/15 text-primary"
                          : cert.type === "MENTOR"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary-container/30 text-tertiary"
                      }`}>
                        {cert.type}
                      </span>
                    </td>
                    <td className="p-4 text-center text-sm font-semibold">
                      {cert.placement ? (
                        <span className="inline-flex items-center gap-0.5 text-amber-600 font-mono font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-xs">
                          <Trophy className="h-3 w-3 text-amber-500 fill-amber-500" />
                          #{cert.placement}
                        </span>
                      ) : (
                        <span className="text-outline text-xs italic">-</span>
                      )}
                    </td>
                    <td className="p-4 text-right pr-6 text-xs text-on-surface-variant font-mono">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
