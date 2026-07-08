import { redirect } from "next/navigation";
import { api } from "@/src/lib/api";
import DashboardLayout from "@/src/components/layouts/DashboardLayout";

export default async function FeaturesLayout({
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
    console.error("Auth verification failed in features layout:", error);
  }

  if (!user) {
    redirect("/sign-in");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
