"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

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
  currentUsername?: string;
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
  currentUsername = "",
}: PollCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [voteData, setVoteData] = useState<Option[]>(
    Array.isArray(options)
      ? options.map((opt) => ({ ...opt, votes: opt.votes || 0 }))
      : []
  );
  const totalVotes = voteData.reduce((sum, opt) => sum + (opt.votes || 0), 0);
  const wsRef = useRef<WebSocket | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Fetch user vote/like
  useEffect(() => {
    if (!userToken) return;
    const fetchUserData = async () => {
      try {
        const [voteRes, likeRes] = await Promise.all([
          api.getUserVote(userToken, id),
          api.getUserLike(userToken, id),
        ]);
        if (voteRes?.voted) {
          setSelected(voteRes.option_id);
          setSubmitted(true);
        }
        if (likeRes?.liked) setLiked(true);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchUserData();
  }, [id, userToken]);

  // WebSocket setup
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
        if (Array.isArray(data.options)) setVoteData(data.options);
        if (data.type === "like_update" || data.likes !== undefined)
          setLikeCount(data.likes);
      } catch (err) {
        console.error("WebSocket parse error:", err);
      }
    };
    ws.onclose = () => console.log(`❌ WS closed for poll ${id}`);
    return () => ws.close();
  }, [id]);

  // Like handler
  const handleLike = async () => {
    if (!userToken) {
      setShowLoginPrompt(true);
      return;
    }
    const prevLiked = liked;
    const prevCount = likeCount;
    setLiked(!prevLiked);
    setLikeCount((c) => c + (prevLiked ? -1 : 1));
    try {
      const res = await api.likePoll(userToken, id);
      if (res?.liked !== undefined) setLiked(res.liked);
      if (res?.likes !== undefined) setLikeCount(res.likes);
    } catch (err) {
      console.error("Like failed:", err);
      setLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  const handleSelect = (optionId: string) => {
    if (submitted) return;
    setSelected(optionId);
  };

  const handleSubmitVote = async () => {
    if (!selected) return;
    if (!userToken) {
      setShowLoginPrompt(true);
      return;
    }
    try {
      await api.vote(userToken, id, selected);
      setSubmitted(true);
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  // Delete flow with modal confirmation
  const handleDeleteClick = () => {
    if (currentUsername === created_by) setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToken) {
      setShowLoginPrompt(true);
      return;
    }
    if (currentUsername !== created_by) return;
    try {
      setIsDeleting(true);
      await api.deletePoll(userToken, id);
      const ev = new CustomEvent("poll:deleted", { detail: { id } });
      window.dispatchEvent(ev);
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete poll.");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      if (e?.detail?.id === id) {
        // handle deletion locally if needed
      }
    };
    window.addEventListener("poll:deleted", handler);
    return () => window.removeEventListener("poll:deleted", handler);
  }, [id]);

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-visible bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg rounded-2xl p-5 border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto mt-6 transition-all"
      >
        {/* Delete icon */}
        {currentUsername === created_by && (
          <div className="absolute top-3 right-3 z-30">
            <div className="relative">
              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                aria-label="Delete poll"
                className="text-lg leading-none text-red-500 hover:text-red-600 disabled:opacity-50 transition transform hover:scale-110"
              >
                {isDeleting ? "⏳" : "🗑"}
              </button>
              <AnimatePresence>
                {showTooltip && (
                  <motion.span
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute -top-8 right-0 bg-gray-800 text-white text-xs rounded-md px-2 py-1 shadow-lg whitespace-nowrap"
                  >
                    Delete poll
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

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
        {voteData.length > 0 ? (
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
            <span className="text-gray-700 dark:text-gray-300">
              {likeCount}
            </span>
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

      {/* 🔒 Login Modal */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl text-center w-80"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Login Required 🔒
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                Please log in to vote or like polls.
              </p>
              <div className="mt-4 flex gap-3 justify-center">
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Go to Login
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🗑 Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl text-center w-80"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Confirm Deletion 🗑️
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                Are you sure you want to delete this poll? This action cannot be
                undone.
              </p>
              <div className="mt-5 flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
