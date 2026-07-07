"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { Zap, Mail, Lock, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

const signInSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
});

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Validation States
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = () => {
    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0] || null);
      setPasswordError(fieldErrors.password?.[0] || null);
      return false;
    }
    setEmailError(null);
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (error) {
        setErrorMessage(error.message || "Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

      {/* Main Card */}
      <main className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-on-surface mb-1">Welcome back</h2>
          <p className="text-sm text-on-surface-variant">Sign in to your ProHack account</p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error rounded-lg p-3 text-sm flex items-start gap-2.5 mb-5">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-status-error" />
            <span className="font-medium leading-normal">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <p className="mt-1.5 text-xs text-status-error font-medium flex items-center gap-1">
                {emailError}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-mono">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
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
              <p className="mt-1.5 text-xs text-status-error font-medium flex items-center gap-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-outline-variant text-primary-container focus:ring-primary-container/25"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm font-medium text-on-surface-variant select-none">
              Remember me
            </label>
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-primary-container text-on-primary hover:bg-primary-container/90 active:bg-primary-container/95 rounded-lg font-semibold text-sm transition-all duration-150 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-outline-variant text-center">
          <p className="text-sm text-on-surface-variant">
            Don't have an account?{" "}
            <Link href="/sign-up" className="font-semibold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
