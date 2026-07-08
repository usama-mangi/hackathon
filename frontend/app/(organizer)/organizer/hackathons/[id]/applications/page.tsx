import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import ApplicationsClient from "./components/ApplicationsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let applications = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    applications = await api(`/hackathon/${id}/applications`);
  } catch (error) {
    console.error(`Failed to load applications for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <ApplicationsClient hackathon={hackathon} initialApplications={applications} />
    </div>
  );
}
