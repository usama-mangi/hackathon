import { redirect } from "next/navigation";
import { api } from "@/src/lib/api";

export default async function Home() {
  let authenticated = false;
  
  try {
    const profile = await api("/me");
    if (profile && profile.user) {
      authenticated = true;
    }
  } catch (error) {
    // Session is invalid or backend is unreachable, default to sign-in redirect
    console.log("Session verification failed, redirecting to sign-in:", error);
  }

  if (authenticated) {
    redirect("/dashboard");
  } else {
    redirect("/sign-in");
  }
}
