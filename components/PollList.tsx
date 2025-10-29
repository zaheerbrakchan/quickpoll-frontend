"use client";

import { useEffect, useState, useRef } from "react";
import PollCard from "./PollCard";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface Option {
  id: string;
  text: string;
  votes?: number;
}

interface Poll {
  id: string;
  title: string;
  description: string;
  options: Option[];
  likes_count: number;
  created_at: string;
  created_by?: string;
}

export default function PollList() {
  const { token } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // ✅ Initial fetch once
  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await api.getPolls();
        setPolls(data);
      } catch (err) {
        console.error("Failed to fetch polls:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [token]);

  // ✅ Real-time global WebSocket listener
  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      "wss://quickpoll-backend-production.up.railway.app/ws/polls";

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log("✅ Connected to global poll WebSocket");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // ✅ Only handle new polls
        if (data.type === "new_poll" && data.id && data.title) {
          setPolls((prev) => [data, ...prev]);
          console.log("🆕 New poll added:", data.title);
        }
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };

    ws.onclose = () => console.log("❌ Global poll WebSocket closed");
    ws.onerror = (err) => console.error("WebSocket error:", err);

    return () => ws.close();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        Loading polls...
      </div>
    );

  if (!polls.length)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500">
        No polls found.
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {polls.map((poll) => (
        <PollCard
          key={poll.id}
          id={poll.id}
          title={poll.title}
          description={poll.description}
          options={poll.options}
          likes={poll.likes_count}
          created_at={poll.created_at}
          created_by={poll.created_by || "Anonymous"}
          userToken={token ?? ""}
        />
      ))}
    </div>
  );
}
