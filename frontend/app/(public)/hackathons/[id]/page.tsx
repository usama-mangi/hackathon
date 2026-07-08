import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import JoinHackathonButton from "@/src/components/layouts/JoinHackathonButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonOverviewPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon;

  try {
    hackathon = await api(`/hackathon/${id}`);
  } catch (err) {
    console.error("Failed to load overview data:", err);
    notFound();
  }

  // Determine status
  const getStatusLabel = (startStr: string, endStr: string, isActive: boolean) => {
    if (!isActive) return "COMPLETED";
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (now > end) return "COMPLETED";
    if (now >= start && now <= end) return "LIVE";
    return "UPCOMING";
  };

  const statusLabel = getStatusLabel(hackathon.startsAt, hackathon.endsAt, hackathon.isActive);
  const isCompleted = statusLabel === "COMPLETED";

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 items-start">
      {/* Left Column - Description */}
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="font-display font-bold text-xl text-on-surface mb-4">About the Hackathon</h2>
          <div className="text-sm text-on-surface-variant leading-relaxed space-y-4 whitespace-pre-line">
            {hackathon.description || "No detailed description has been provided for this hackathon yet. Stay tuned for updates!"}
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h2 className="font-display font-bold text-xl text-on-surface mb-4">Event Guidelines & Rules</h2>
          <ul className="space-y-3 text-sm text-on-surface-variant list-disc pl-5 leading-relaxed">
            <li>Submissions must be original work created during the hackathon timeline.</li>
            <li>Teams can have up to 5 members. Cross-disciplinary teams are highly encouraged.</li>
            <li>Code repositories must be public and include a clear README file with installation instructions.</li>
            <li>Include a short demonstration video (max 3 minutes) walking through the user flow and architecture.</li>
            <li>Respect the community guidelines. Any form of harassment or copying will result in immediate disqualification.</li>
          </ul>
        </div>
      </div>

      {/* Right Column - Quick Info & Actions */}
      <div className="lg:col-span-4 space-y-6">
        {/* Registration CTA card */}
        {!isCompleted && (
          <div className="bg-primary-container/5 border border-primary-container/20 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-display font-bold text-lg text-primary">Registration Open</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Register now to secure your spot, form a team, and collaborate with developers, designers, and mentors globally.
            </p>
            <div className="pt-2">
              <JoinHackathonButton hackathonId={id} />
            </div>
          </div>
        )}

        {/* Quick Facts Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
          <h3 className="font-display font-bold text-lg text-on-surface mb-4">Quick Facts</h3>
          <div className="space-y-4 text-xs font-mono text-on-surface-variant">
            <div className="border-b border-outline-variant/60 pb-3">
              <span className="font-bold text-on-surface block text-[10px] uppercase font-sans text-secondary mb-1">
                Starts At
              </span>
              {new Date(hackathon.startsAt).toLocaleDateString("en-US", options)}
            </div>

            <div className="border-b border-outline-variant/60 pb-3">
              <span className="font-bold text-on-surface block text-[10px] uppercase font-sans text-secondary mb-1">
                Ends At
              </span>
              {new Date(hackathon.endsAt).toLocaleDateString("en-US", options)}
            </div>

            <div className="border-b border-outline-variant/60 pb-3">
              <span className="font-bold text-on-surface block text-[10px] uppercase font-sans text-secondary mb-1">
                Status
              </span>
              <span className={`inline-block font-sans font-bold px-2 py-0.5 rounded text-[10px] ${
                statusLabel === "LIVE" 
                  ? "bg-status-success/15 text-status-success" 
                  : statusLabel === "UPCOMING" 
                  ? "bg-status-warning/15 text-status-warning" 
                  : "bg-outline/10 text-secondary"
              }`}>
                {statusLabel}
              </span>
            </div>

            <div>
              <span className="font-bold text-on-surface block text-[10px] uppercase font-sans text-secondary mb-1">
                Participation Counts
              </span>
              <div className="flex gap-4 font-sans text-xs">
                <div>
                  <span className="font-bold text-on-surface text-sm font-mono block">
                    {hackathon._count?.participants || 0}
                  </span>
                  Hackers joined
                </div>
                <div>
                  <span className="font-bold text-on-surface text-sm font-mono block">
                    {hackathon._count?.teams || 0}
                  </span>
                  Teams formed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
