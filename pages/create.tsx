import { useState } from "react";
import { createPoll } from "@/lib/api";
import { useRouter } from "next/router";

export default function CreatePoll() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState([{ text: "" }]);
  const router = useRouter();
  const token = localStorage.getItem("token") || "";

  const addOption = () => setOptions([...options, { text: "" }]);
  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPoll(token, { title, description, options });
      alert("Poll created!");
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 w-full"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 w-full"
      />
      {options.map((opt, i) => (
        <input
          key={i}
          type="text"
          placeholder={`Option ${i + 1}`}
          value={opt.text}
          onChange={(e) => updateOption(i, e.target.value)}
          className="border p-2 w-full"
        />
      ))}
      <button type="button" onClick={addOption} className="bg-gray-500 text-white px-2 py-1 rounded">
        Add Option
      </button>
      <button type="submit" className="bg-blue-500 text-white px-2 py-1 rounded">
        Create Poll
      </button>
    </form>
  );
}
