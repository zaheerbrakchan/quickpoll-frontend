// pages/login.tsx
"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ Error message state

  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await api.login(username, password);
    setLoading(false);

    // ❌ If invalid credentials or network error
    if (res.error) {
      setError(res.error);
      return;
    }

    // ✅ Successful login
    try {
      login(res.access_token, res.username);
      router.push("/");
    } catch (err) {
      console.error("Login handling error:", err);
      setError("Something went wrong while logging in. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="max-w-md mx-auto mt-10 p-6 border rounded-lg shadow-md bg-white"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

      {/* ✅ Inline red error message */}
      {error && (
        <p className="text-red-600 bg-red-100 border border-red-300 rounded-md px-3 py-2 mb-4 text-center">
          {error}
        </p>
      )}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border p-2 w-full mb-3 rounded"
        required
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full mb-4 rounded"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 w-full rounded ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
