"use client";

import React, { useState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/src/lib/auth-client";
import { Zap, Mail, AlertTriangle, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setEmailError(null);

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors = z.treeifyError(result.error).properties;
      setEmailError(fieldErrors?.email?.errors?.[0] || null);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await requestPasswordReset({
        email,
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : "/reset-password",
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to submit password reset request.");
      } else {
        setStatus("success");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center w-full max-w-[440px]">
        {/* Header Logo */}
        <div className="mb-8 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="font-display font-bold text-2xl tracking-tight text-on-surface">Epoch</h1>
        </div>

        {/* Card Wrapper */}
        <main className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm text-center">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center text-status-success">
              <CheckCircle className="w-10 h-10" />
            </div>
          </div>

          <h2 className="font-display font-bold text-xl text-on-surface mb-2">Check your email</h2>
          <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
            We have sent a password reset link to <strong className="text-on-surface">{email}</strong>. Please check your inbox and spam folders.
          </p>

          <Link
            href="/sign-in"
            className="w-full py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            Back to Sign In
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-[440px]">
      {/* Header Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-on-surface">Epoch</h1>
      </div>

      {/* Card Wrapper */}
      <main className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-on-surface mb-1">Forgot Password</h2>
          <p className="text-sm text-on-surface-variant">Enter your email and we'll send you a password reset link</p>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error rounded-lg p-3 text-sm flex items-start gap-2.5 mb-5">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="font-medium leading-normal">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isLoading}
                className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline/75 focus:outline-none focus:ring-2 transition-all ${
                  emailError
                    ? "border-status-error focus:ring-status-error/20 focus:border-status-error"
                    : "border-outline-variant focus:ring-primary-container/20 focus:border-primary-container"
                }`}
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-outline" />
            </div>
            {emailError && (
              <p className="mt-1.5 text-xs text-status-error font-medium">
                {emailError}
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-outline-variant text-center">
          <Link href="/sign-in" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </main>
    </div>
  );
}
