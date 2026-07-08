"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { Zap, Lock, AlertTriangle, Eye, EyeOff, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Form Fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field Errors
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setPasswordError(null);
    setConfirmPasswordError(null);

    if (!token) {
      setErrorMessage("Reset token is missing. Please request a new password reset link.");
      return;
    }

    const result = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setPasswordError(fieldErrors.password?.[0] || null);
      setConfirmPasswordError(fieldErrors.confirmPassword?.[0] || null);
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "Failed to reset password. The link may have expired.");
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
      <div className="w-full text-center">
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-status-success/10 flex items-center justify-center text-status-success">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>

        <h2 className="font-display font-bold text-xl text-on-surface mb-2">Password Reset Successful</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
          Your password has been updated. You can now sign in with your new credentials.
        </p>

        <Link
          href="/sign-in"
          className="w-full py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="font-display font-bold text-xl text-on-surface mb-1">Reset Password</h2>
        <p className="text-sm text-on-surface-variant">Please choose a new secure password for your account</p>
      </div>

      {/* Global Error Alert */}
      {errorMessage && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error rounded-lg p-3 text-sm flex items-start gap-2.5 mb-5">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <span className="font-medium leading-normal">{errorMessage}</span>
        </div>
      )}

      {!token ? (
        <div className="space-y-4">
          <div className="bg-status-warning/10 border border-status-warning/20 text-status-warning rounded-lg p-3.5 text-sm flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="leading-normal">
              No reset token found in URL parameters. Please use the link sent to your email or request a new reset email.
            </span>
          </div>
          <Link
            href="/forgot-password"
            className="w-full mt-4 py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer shadow-sm"
          >
            Request New Reset Link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider font-mono">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                disabled={isLoading}
                className={`w-full bg-white border rounded-lg pl-10 pr-10 py-2.5 text-sm text-on-surface placeholder:text-outline/75 focus:outline-none focus:ring-2 transition-all ${
                  passwordError
                    ? "border-status-error focus:ring-status-error/20 focus:border-status-error"
                    : "border-outline-variant focus:ring-primary-container/20 focus:border-primary-container"
                }`}
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-outline" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3 top-3 text-outline hover:text-on-surface transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {passwordError && (
              <p className="mt-1.5 text-xs text-status-error font-medium">
                {passwordError}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider font-mono">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                disabled={isLoading}
                className={`w-full bg-white border rounded-lg pl-10 pr-10 py-2.5 text-sm text-on-surface placeholder:text-outline/75 focus:outline-none focus:ring-2 transition-all ${
                  confirmPasswordError
                    ? "border-status-error focus:ring-status-error/20 focus:border-status-error"
                    : "border-outline-variant focus:ring-primary-container/20 focus:border-primary-container"
                }`}
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-outline" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3 top-3 text-outline hover:text-on-surface transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
            {confirmPasswordError && (
              <p className="mt-1.5 text-xs text-status-error font-medium">
                {confirmPasswordError}
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      )}
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-on-surface-variant font-medium">Loading parameters...</p>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
