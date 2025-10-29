"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

type Option = {
  id: string;
  text: string;
  votes?: number;
};

type PollCardProps = {
  id: string;
  title: string;
  description?: string;
  options?: Option[];
  likes?: number;
  created_at?: string;
  created_by?: string;
  userToken?: string;
};

export default function PollCard({
  id,
  title,
  description = "",
  options = [],
  likes = 0,
  created_at = new Date().toISOString(),
  created_by = "Anonymous",
  userToken,
}: PollCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [voteData, setVoteData] = useState<Option[]>(
    Array.isArray(options)
      ? options.map((opt) => ({ ...opt, votes: opt.votes || 0 }))
      : []
  );

  const totalVotes = Array.isArray(voteData)
    ? voteData.reduce((sum, opt) => sum + (opt.votes || 0), 0)
    : 0;

  const wsRef = useRef<WebSocket | null>(null);

  // ✅ Fetch if user has already voted and liked
  useEffect(() => {
    if (!userToken) return;

    const fetchUserData = async () => {
      try {
        const [voteRes, likeRes] = await Promise.all([
          api.getUserVote(userToken, id),
          api.getUserLike(userToken, id),
        ]);

        if (voteRes && voteRes.voted) {
          setSelected(voteRes.option_id);
          setSubmitted(true);
        }

        if (likeRes && likeRes.liked) {
          setLiked(true);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, [id, userToken]);

  // 🧩 Connect WebSocket for live vote and like updates
  useEffect(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      `wss://quickpoll-backend-production.up.railway.app/ws/polls/${id}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log(`✅ Connected to poll ${id} WebSocket`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.poll_id !== id) return;

        // Vote update
        if (Array.isArray(data.options)) {
          setVoteData(data.options);
        }

        // Like update
        if (data.type === "like_update" || typeof data.likes !== "undefined") {
          // Accept either { type: "like_update", likes } or older shape
          setLikeCount(data.likes);
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
      }
    };
    ws.onclose = () => console.log(`❌ WebSocket closed for poll ${id}`);
    ws.onerror = (e) => console.error("WebSocket error:", e);
    return () => ws.close();
  }, [id]);

  // ❤️ Handle Like (with optimistic UI + rollback)
  const handleLike = async () => {
    if (!userToken) {
      alert("Please login to like polls.");
      return;
    }

    // capture previous state for rollback
    const prevLiked = liked;
    const prevCount = likeCount;

    // optimistic update (flip)
    setLiked(!prevLiked);
    setLikeCount((c) => c + (prevLiked ? -1 : 1));

    try {
      const res = await api.likePoll(userToken, id);
      // backend: { liked: boolean, likes: number }
      if (res && typeof res.liked !== "undefined") {
        setLiked(res.liked);
      }
      if (res && typeof res.likes !== "undefined") {
        setLikeCount(res.likes);
      }
    } catch (err) {
      console.error("Like failed:", err);
      // rollback on error
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  // 🗳️ Select option
  const handleSelect = (optionId: string) => {
    if (submitted) return; // Prevent re-select if already voted
    setSelected(optionId);
  };

  // 🚀 Submit vote
  const handleSubmitVote = async () => {
    if (!selected) return;
    if (!userToken) {
      alert("Please login to vote.");
      return;
    }

    try {
      await api.vote(userToken, id, selected);
      setSubmitted(true);

      // Optimistic UI update before WebSocket sync
      setVoteData((prev) =>
        Array.isArray(prev)
          ? prev.map((opt) =>
              opt.id === selected
                ? { ...opt, votes: (opt.votes || 0) + 1 }
                : opt
            )
          : prev
      );
    } catch (err) {
      console.error("Vote failed:", err);
      alert("You might have already voted for this poll.");
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg rounded-2xl p-5 border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto mt-6 transition-all"
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          🗳️ {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Options */}
      {Array.isArray(voteData) && voteData.length > 0 ? (
        <div className="space-y-3">
          {voteData.map((option) => {
            const percentage =
              totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
            const isSelected = selected === option.id;

            return (
              <motion.div
                key={option.id}
                whileTap={{ scale: submitted ? 1 : 0.97 }}
                onClick={() => handleSelect(option.id)}
                className={`relative w-full px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/40"
                    : submitted
                    ? "border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-700/60 cursor-not-allowed"
                    : "border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/40 hover:bg-blue-50/60"
                }`}
              >
                {/* Progress Bar */}
                {(submitted || totalVotes > 0) && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.6 }}
                    className={`absolute left-0 top-0 h-full rounded-xl z-0 ${
                      isSelected ? "bg-blue-500/30" : "bg-gray-400/20"
                    }`}
                  />
                )}

                <div className="flex justify-between items-center relative z-10">
                  <span
                    className={`font-medium ${
                      isSelected
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {option.text}
                  </span>
                  {(submitted || totalVotes > 0) && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic">No options available</p>
      )}

      {/* Submit Button */}
      {!submitted && selected && (
        <motion.button
          onClick={handleSubmitVote}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-4 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-all font-medium"
        >
          Submit Vote
        </motion.button>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-5 border-t border-gray-200 dark:border-gray-700 pt-3">
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.15 }}
          className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-all"
        >
          <motion.span
            animate={{ scale: liked ? 1.3 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {liked ? "❤️" : "🤍"}
          </motion.span>
          <span className="text-gray-700 dark:text-gray-300">{likeCount}</span>
        </motion.button>

        <span>
          by <b>{created_by}</b> •{" "}
          {new Date(created_at).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </motion.div>
  );
}
