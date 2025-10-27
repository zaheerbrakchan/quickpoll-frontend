import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PollCard from "./PollCard";

export default function PollList() {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    async function fetchPolls() {
      try {
        const data = await api.getPolls();
        setPolls(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchPolls();
  }, []);

  return (
    <div className="space-y-4">
      {polls.map((poll: any) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
