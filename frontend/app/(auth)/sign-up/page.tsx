"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { Zap, User, Mail, Lock, AlertTriangle, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required").min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const router = useRouter();
  
  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"PARTICIPANT" | "ORGANIZER">("PARTICIPANT");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validation Errors
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  const validateForm = () => {
    const result = signUpSchema.safeParse({ name, email, password, confirmPassword });
    if (!result.success) {
      // Flatten the field errors. Use formattedErrors or flatten()
      const fieldErrors = result.error.flatten().fieldErrors;
      setNameError(fieldErrors.name?.[0] || null);
      setEmailError(fieldErrors.email?.[0] || null);
      setPasswordError(fieldErrors.password?.[0] || null);
      setConfirmPasswordError(fieldErrors.confirmPassword?.[0] || null);
      return false;
    }
    setNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Cast the authClient signUp call as any to allow the custom property signupRole
      const { data, error } = await (authClient.signUp.email as any)({
        email,
        password,
        name,
        signupRole: role,
      });

      if (error) {
        setErrorMessage(error.message || "Failed to create account. Please try again.");
      } else {
        // Redirect to verify email page, passing the email as a query param
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred during signup.");
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

      {/* Card Wrapper */}
      <main className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="font-display font-bold text-xl text-on-surface mb-1">Create an account</h2>
          <p className="text-sm text-on-surface-variant">Join ProHack to build, mentor, or host hackathons</p>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="bg-status-error/10 border border-status-error/20 text-status-error rounded-lg p-3 text-sm flex items-start gap-2.5 mb-5">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span className="font-medium leading-normal">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider font-mono">
              Join as a
            </label>
            <div className="flex p-1 bg-surface-container rounded-lg border border-outline-variant/40 w-full">
              <button
                type="button"
                onClick={() => setRole("PARTICIPANT")}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                  role === "PARTICIPANT"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                }`}
              >
                Participant
              </button>
              <button
                type="button"
                onClick={() => setRole("ORGANIZER")}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
                  role === "ORGANIZER"
                    ? "bg-primary-container text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/50"
                }`}
              >
                Organizer
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-outline leading-tight">
              {role === "PARTICIPANT" 
                ? "Compete in hackathons, join teams, submit projects, and earn certificates."
                : "Host hackathons, evaluate project submissions, manage mentors, and issue certificates."
              }
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider font-mono">
              Full Name
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                placeholder="Alex Chen"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                disabled={isLoading}
                className={`w-full bg-white border rounded-lg pl-10 pr-4 py-2.5 text-sm text-on-surface placeholder:text-outline/75 focus:outline-none focus:ring-2 transition-all ${
                  nameError
                    ? "border-status-error focus:ring-status-error/20 focus:border-status-error"
                    : "border-outline-variant focus:ring-primary-container/20 focus:border-primary-container"
                }`}
              />
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-outline" />
            </div>
            {nameError && (
              <p className="mt-1.5 text-xs text-status-error font-medium">
                {nameError}
              </p>
            )}
          </div>

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

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider font-mono">
              Password
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
              Confirm Password
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
                Creating Account...
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-outline-variant text-center">
          <p className="text-sm text-on-surface-variant">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
