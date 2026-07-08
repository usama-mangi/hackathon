"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabProps {
  hackathonId: string;
}

export default function HackathonDetailTabs({ hackathonId }: TabProps) {
  const pathname = usePathname();

  const tabs = [
    { name: "Overview", href: `/hackathons/${hackathonId}` },
    { name: "Schedule", href: `/hackathons/${hackathonId}/events` },
    { name: "Submissions", href: `/hackathons/${hackathonId}/submissions` },
    { name: "Announcements", href: `/hackathons/${hackathonId}/announcements` },
    { name: "Results", href: `/hackathons/${hackathonId}/results` },
  ];

  return (
    <div className="flex gap-2 border-b border-outline-variant pb-px overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              isActive
                ? "text-primary-container border-b-2 border-primary-container"
                : "text-on-surface-variant hover:text-on-surface hover:border-b-2 hover:border-outline"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
