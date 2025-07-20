"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowResendVerification(false);
    setResendMessage("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("verify your email")) {
          setError("Please verify your email address before signing in.");
          setShowResendVerification(true);
          setResendEmail(email);
        } else {
        setError("Invalid email or password");
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) return;
    
    setResendLoading(true);
    setResendMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setResendMessage("Verification email sent! Please check your inbox.");
      } else {
        setResendMessage(data.message || "Failed to send verification email.");
      }
    } catch (error) {
      setResendMessage("An error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E6E5C] flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-green-700 focus:border-green-700 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-green-700 focus:border-green-700 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {showResendVerification && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="text-sm text-yellow-800 mb-3">
                  <p>Your email address needs to be verified before you can sign in.</p>
                </div>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? "Sending..." : "Resend Verification Email"}
                </button>
                {resendMessage && (
                  <div className={`text-sm mt-2 ${resendMessage.includes("sent") ? "text-green-600" : "text-red-600"}`}>
                    {resendMessage}
                  </div>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/user-auth/signup" className="font-medium text-green-700 hover:text-green-900">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
} 