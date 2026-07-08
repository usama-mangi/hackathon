import { redirect } from "next/navigation";
import { api } from "@/src/lib/api";
import DashboardLayout from "@/src/components/layouts/DashboardLayout";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default async function ParticipantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    const profile = await api("/me");
    if (profile && profile.user) {
      user = profile.user;
    }
  } catch (error) {
    console.error("Auth verification failed in participant layout:", error);
  }

  if (!user) {
    redirect("/sign-in");
  }

  // RBAC check: only PARTICIPANT role is allowed to access participant pages
  if (user.role !== "PARTICIPANT") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-md mx-auto gap-5">
          <div className="w-16 h-16 rounded-2xl bg-status-error/10 border border-status-error/20 flex items-center justify-center text-status-error">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-on-surface mb-2">
              Access Denied
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              This area is restricted to <strong className="text-on-surface font-mono">PARTICIPANT</strong> accounts.
              Your current role is <strong className="text-on-surface font-mono">{user.role}</strong>.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href="/sign-in"
              className="flex-1 text-center py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Switch Account
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
