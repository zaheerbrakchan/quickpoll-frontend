"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
      {/* Logo / App Name */}
      <Link href="/" className="text-xl font-semibold">
        QuickPoll
      </Link>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            {/* 👋 Show logged-in username */}
            <span className="text-gray-300">👋 {user}</span>

            <Link
              href="/create"
              className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
            >
              Create Poll
            </Link>

            <button
              onClick={logout}
              className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="px-3 py-2 bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-3 py-2 bg-green-600 rounded hover:bg-green-700 cursor-pointer"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
