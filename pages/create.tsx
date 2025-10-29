// pages/create.tsx
"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";

export default function CreatePoll() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([{ text: "" }]);
  const router = useRouter();
  const { user, token } = useAuth();

  // ✅ Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      alert("Please login first to create a poll.");
      router.push("/login");
    }
  }, [token, router]);

  const addOption = () => setOptions([...options, { text: "" }]);

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("Please login first.");
      router.push("/login");
      return;
    }

    try {
      await api.createPoll(token, { title, description, options });
      
      router.push("/");
    } catch (err) {
      console.error("Poll creation failed:", err);
      alert("Failed to create poll. Please try again.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">🗳️ Create a New Poll</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Poll Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 w-full rounded"
          rows={3}
        />

        <div className="space-y-2">
          {options.map((opt, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt.text}
              onChange={(e) => updateOption(i, e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addOption}
          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded w-full"
        >
          ➕ Add Option
        </button>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded w-full font-semibold"
        >
          🚀 Create Poll
        </button>
      </form>
    </div>
  );
}
