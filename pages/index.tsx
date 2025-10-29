"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PollList from "@/components/PollList";

export default function HomePage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Fetch polls once on initial page load
  const fetchPolls = async () => {
    try {
      const data = await api.getPolls();
      setPolls(data);
    } catch (err: any) {
      setError(err.message || "Failed to load polls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls(); // 🔥 Only once
  }, []);

  if (loading)
    return <div className="p-8 text-center text-gray-500">Loading polls...</div>;

  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="min-h-screen bg-[lightslategrey] text-gray-900">
      <h1 className="text-3xl font-bold mb-6 text-center">🗳️ QuickPoll</h1>

      {polls.length === 0 ? (
        <p className="text-center text-gray-600">
          No polls yet. Be the first to create one!
        </p>
      ) : (
        // ✅ Just render PollList (it manages WebSocket updates internally)
        <PollList />
      )}
    </main>
  );
}
