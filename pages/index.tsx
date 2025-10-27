import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PollList from "@/components/PollList";

export default function HomePage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all polls
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
    fetchPolls();

    // 🔁 Auto-refresh every 5 seconds for live updates
    const interval = setInterval(fetchPolls, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading polls...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🗳️ QuickPoll</h1>
      {polls.length === 0 ? (
        <p className="text-center text-gray-600">No polls yet. Be the first to create one!</p>
      ) : (
        <PollList polls={polls} />
      )}
    </main>
  );
}
