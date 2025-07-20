"use client";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navigation/navbar";

export default function SignOutPage() {
  const router = useRouter();
  useEffect(() => {
    signOut({ redirect: false });
  }, []);

  return (
    <div className="min-h-screen bg-[#0E6E5C] flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-green-700 mb-4">You have been signed out</h2>
          <div className="flex space-x-4">
            <Link href="/">
              <button className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full transition duration-300">Home</button>
            </Link>
            <Link href="/user-auth/signin">
              <button className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-full transition duration-300">Sign In</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 