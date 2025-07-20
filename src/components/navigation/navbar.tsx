"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { FaHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  console.log('Navbar session:', session);

  const handleGetStarted = () => {
    if (session) {
      // If user is logged in, redirect to drives page
      router.push("/drives");
    } else {
      // If user is not logged in, redirect to signup page
      router.push("/user-auth/signup");
    }
  };

  return (
    <nav className="bg-[#0E6E5C] fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <FaHeart className="h-6 w-6 text-[#E87B5A]" />
            <span className="text-xl font-semibold text-white">Together We Can</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/drives" className="text-white/80 hover:text-white transition-colors">
              Find Drives
            </Link>
            <Link href="/create" className="text-white/80 hover:text-white transition-colors">
              Create Drives
            </Link>
            <Link href="/blog" className="text-white/80 hover:text-white transition-colors">
              Blogs
            </Link>
            <Link href="/contact" className="text-white/80 hover:text-white transition-colors">
              Contact Us
            </Link>
            <button 
              onClick={() => session ? router.push("/profile") : router.push("/user-auth/signin")}
              className="bg-[#F2994A] hover:bg-[#f2994a]/80 text-white font-bold py-2 px-6 rounded-full shadow-md transition duration-300"
            >
              {session ? "Profile" : "Sign Up / Sign In"}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white/80 hover:text-white"
            >
              <svg
                className="h-6 w-6"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#0E6E5C]">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 text-white/80 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/drives"
              className="block px-3 py-2 text-white/80 hover:text-white transition-colors"
            >
              Find Drives
            </Link>
            <Link
              href="/create"
              className="block px-3 py-2 text-white/80 hover:text-white transition-colors"
            >
              Create Drives
            </Link>
            <Link
              href="/blog"
              className="block px-3 py-2 text-white/80 hover:text-white transition-colors"
            >
              Blogs
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-white/80 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
            <div className="px-3 py-2">
              <button 
                onClick={() => session ? router.push("/profile") : router.push("/user-auth/signin")}
                className="w-full bg-[#F2994A] hover:bg-[#f2994a]/80 text-white font-bold px-4 py-2 rounded-full shadow-md transition duration-300"
              >
                {session ? "Profile" : "Sign Up / Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}; 