import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import { Pin, Mail, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

interface AnnouncementItem {
  id: string;
  hackathonId: string;
  title: string;
  content: string;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonAnnouncementsPage({ params }: PageProps) {
  const { id } = await params;
  let announcements: AnnouncementItem[] = [];
  let error: string | null = null;

  try {
    announcements = await api(`/hackathon/${id}/announcements`);
  } catch (err: any) {
    console.error("Failed to load announcements:", err);
    error = err?.message || "Could not retrieve announcements.";
  }

  // Sort chronologically (latest first)
  announcements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Helper to format announcement post time
  const formatTimeAgo = (createdAt: string) => {
    const postDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${Math.max(1, diffMins)} MINUTE${diffMins !== 1 ? "S" : ""} AGO`;
    } else if (diffHours < 24) {
      return `${diffHours} HOUR${diffHours !== 1 ? "S" : ""} AGO`;
    } else {
      return `${diffDays} DAY${diffDays !== 1 ? "S" : ""} AGO`;
    }
  };

  // We will treat the very first announcement as pinned for aesthetic alignment with Stitch
  const pinnedAnnouncement = announcements.length > 0 ? announcements[0] : null;
  const regularAnnouncements = announcements.length > 1 ? announcements.slice(1) : (announcements.length === 1 ? [] : []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 items-start">
      {/* Left Column: Feed */}
      <main className="lg:col-span-8 space-y-6 w-full">
        {announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
            <FileText className="w-12 h-12 text-outline mb-4" />
            <h3 className="font-display font-semibold text-lg text-on-surface">No Announcements</h3>
            <p className="text-sm text-on-surface-variant mt-1">There are no announcements posted for this hackathon yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Render Pinned Announcement first */}
            {pinnedAnnouncement && (
              <article className="bg-surface-container-lowest border border-primary-container/30 rounded-xl p-6 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.08)] relative overflow-hidden group hover:border-primary-container/60 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-container" />
                <header className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-primary-container font-mono text-[10px] font-bold tracking-widest">
                    <Pin className="h-3.5 w-3.5 fill-current rotate-45" />
                    <span>PINNED · {formatTimeAgo(pinnedAnnouncement.createdAt)}</span>
                  </div>
                </header>
                <h2 className="font-display font-bold text-lg text-slate-900 mb-3 group-hover:text-primary transition-colors">
                  {pinnedAnnouncement.title}
                </h2>
                <div className="text-sm text-on-surface-variant mb-5 leading-relaxed whitespace-pre-line">
                  {pinnedAnnouncement.content}
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-surface-container-low text-primary px-2.5 py-1 rounded border border-outline-variant text-[11px] font-medium font-mono">
                    Announcements
                  </span>
                  <span className="bg-error-container text-on-error-container px-2.5 py-1 rounded border border-error-container text-[11px] font-medium font-mono">
                    Important
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/60">
                  <img
                    className="w-8 h-8 rounded-full border border-outline-variant object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvIVgd_FxHs1znrBS04IOngCk_dcluc-L-iHOIlpCw_5QSRsCWIGXEHqkD1HngqclbKHMk3zPrhZRSg5mZ4s_jcHJcKzCOGumJip5d3rlFuXz9tazBCivi-WLuHidW1QjF-ozt3O78U1udWr1jgnJ12CHVYXk7TOu9oa7bCNAL-9mK81e2sFpd_wew6i5dsl80Nyh9ILARmZ36GHyFgj6gLYex4LGiAMvGirLSuo4gAMfS-43GCuPV-VRZGM8CcsCgQIIM8rah9Fk"
                    alt="Sarah K."
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">Sarah K.</p>
                    <p className="text-[10px] text-on-surface-variant">Lead Organizer</p>
                  </div>
                </div>
              </article>
            )}

            {/* Render remaining announcements */}
            {regularAnnouncements.map((ann) => (
              <article key={ann.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm hover:border-slate-400 transition-colors">
                <header className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-on-surface-variant font-mono text-[10px] font-bold tracking-widest uppercase">
                    <span>{formatTimeAgo(ann.createdAt)}</span>
                  </div>
                </header>
                <h2 className="font-display font-bold text-base text-slate-900 mb-3">
                  {ann.title}
                </h2>
                <div className="text-sm text-on-surface-variant mb-5 leading-relaxed whitespace-pre-line">
                  {ann.content}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/60">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs">
                    JD
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 leading-tight">James D.</p>
                    <p className="text-[10px] text-on-surface-variant">Mentor Coordinator</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Right Column: Sidebar */}
      <aside className="lg:col-span-4 space-y-6 w-full">
        {/* Stats Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-sm text-slate-900 mb-4 border-b border-outline-variant pb-2">
            Announcement Stats
          </h3>
          <ul className="space-y-3 text-xs font-mono text-on-surface-variant">
            <li className="flex justify-between items-center">
              <span>Total Published</span>
              <span className="text-slate-900 font-bold">{announcements.length}</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Pinned Items</span>
              <span className="text-slate-900 font-bold">{pinnedAnnouncement ? 1 : 0}</span>
            </li>
          </ul>
        </div>

        {/* Contact Info Card */}
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-on-surface-variant mb-4">
            Key Contact
          </h3>
          <div className="flex flex-col items-center text-center">
            <img
              className="w-16 h-16 rounded-full border-2 border-white shadow-sm object-cover mb-3"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtdOLjl7O3gQZ1cv9miJWm3KUY1BtHNUY0t9L6h8wPCrrUPBh38hdBgRbyabbOYGIGjd7Yjrpy5XfUYUx1ar85RgVxXicw7i1GLJx6WoD6LrVI5tqCOB-GTVXG6VBRMKXucT9rCW0D6loZjO9nKeN9EdeJGOvK0gpc2f0BviUm-ojltJ7jx10dij1FhSZxO1ogpZiRbmUuV_bYQdAg1nP3QqXP0OT6tGIojJD3eO4sBACBcTE3U1sTs9Fa0QfM3fdYh1xxBnfqWTc"
              alt="Sarah K."
            />
            <h4 className="font-display font-bold text-sm text-slate-900">Sarah K.</h4>
            <p className="text-xs text-on-surface-variant mb-4">Lead Organizer</p>
            <button className="w-full bg-white border border-outline-variant text-slate-900 font-semibold py-1.5 px-3 rounded hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 text-xs">
              <Mail className="h-4 w-4" />
              Message
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
