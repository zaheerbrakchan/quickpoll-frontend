import { useState } from "react";
import { api } from "@/lib/api";

export default function PollCard({ poll }: { poll: any }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [likes, setLikes] = useState(poll.likes || 0);
  const [votes, setVotes] = useState(poll.options || []);

  const token = localStorage.getItem("token") || "";

  const handleVote = async () => {
    if (!selected) return alert("Select an option!");
    try {
      await api.vote(token, poll.id, selected);
      alert("Vote submitted!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async () => {
    try {
      await api.likePoll(token, poll.id);
      setLikes((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="font-bold">{poll.title}</h2>
      <p>{poll.description}</p>

      <div className="mt-2 space-y-1">
        {poll.options.map((opt: any) => (
          <label key={opt.id} className="block">
            <input
              type="radio"
              name={`poll-${poll.id}`}
              value={opt.id}
              onChange={() => setSelected(opt.id)}
            />
            {opt.text}
          </label>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <button onClick={handleVote} className="bg-blue-500 text-white px-2 py-1 rounded">
          Vote
        </button>
        <button onClick={handleLike} className="bg-red-500 text-white px-2 py-1 rounded">
          Like ({likes})
        </button>
      </div>
    </div>
  );
}
