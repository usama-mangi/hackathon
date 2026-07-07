"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { Zap, Mail, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email address";
  
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const handleOpenGmail = () => {
    window.open("https://mail.google.com", "_blank", "noopener,noreferrer");
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendStatus("idle");
    setResendError(null);

    try {
      const { data, error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: typeof window !== "undefined" ? `${window.location.origin}/dashboard` : "/dashboard",
      });

      if (error) {
        setResendStatus("error");
        setResendError(error.message || "Failed to resend verification email.");
      } else {
        setResendStatus("success");
      }
    } catch (err: any) {
      setResendStatus("error");
      setResendError(err.message || "An unexpected error occurred.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-[440px]">
      {/* Header Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <h1 className="font-display font-bold text-2xl tracking-tight text-on-surface">ProHack</h1>
      </div>

      {/* Verification Card */}
      <main className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-8 flex flex-col items-center text-center shadow-sm">
        {/* Envelope Illustration with Checkmark icon in #2563eb */}
        <div className="mb-6 w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center relative text-primary-container">
          <Mail className="h-8 w-8 text-primary-container" />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
            <CheckCircle2 className="h-5 w-5 text-primary-container fill-white" />
          </div>
        </div>

        {/* Heading & Subtext */}
        <h2 className="font-display font-bold text-xl text-on-surface mb-3">Check your email</h2>
        <p className="font-body text-sm text-on-surface-variant mb-8 px-2 leading-relaxed">
          We sent a verification link to <span className="font-mono font-medium text-on-surface bg-surface-container-low px-1.5 py-0.5 rounded border border-outline-variant/40">{email}</span>. Click the link in the email to activate your ProHack account.
        </p>

        {/* Action Feedbacks */}
        {resendStatus === "success" && (
          <div className="w-full bg-status-success/10 border border-status-success/20 text-status-success rounded-lg p-3 text-xs mb-5 font-semibold">
            Verification email resent successfully!
          </div>
        )}
        {resendStatus === "error" && (
          <div className="w-full bg-status-error/10 border border-status-error/20 text-status-error rounded-lg p-3 text-xs mb-5 font-semibold">
            {resendError}
          </div>
        )}

        {/* Actions */}
        <div className="w-full space-y-4">
          <button
            onClick={handleOpenGmail}
            className="w-full py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
          >
            Open Gmail
            <ArrowRight className="h-4 w-4" />
          </button>
          
          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-outline-variant"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-semibold text-on-surface-variant font-mono uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-outline-variant"></div>
          </div>

          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full py-3 px-4 border border-primary text-primary hover:bg-primary-container/5 active:bg-primary-container/10 bg-transparent rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                Resending...
              </>
            ) : (
              "Resend verification email"
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-outline-variant w-full flex flex-col items-center gap-2">
          <p className="text-[11px] text-outline leading-tight max-w-[280px]">
            Didn't receive it? Check your spam folder or try a different email address.
          </p>
          <div className="flex gap-4 mt-2">
            <Link className="text-xs text-primary font-semibold hover:underline" href="/sign-up">
              Use another email
            </Link>
            <span className="text-outline/50 text-xs">|</span>
            <Link className="text-xs text-primary font-semibold hover:underline" href="/sign-in">
              Back to Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[300px] w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary-container" />
          <p className="mt-4 text-sm text-on-surface-variant font-semibold">Loading verification details...</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
