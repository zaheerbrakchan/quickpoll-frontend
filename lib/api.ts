// lib/api.ts
const BASE_URL = "https://quickpoll-backend-production.up.railway.app/api";

export const api = {
  // ----- AUTH -----
  register: async (username: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error("Registration failed");
    return res.json();
  },

  login: async (username: string, email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username,email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    return res.json();
  },

  // ----- POLLS -----
  getPolls: async () => {
    const res = await fetch(`${BASE_URL}/polls/`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch polls");
    return res.json();
  },

getPollById: async (pollId: number) => {
    const res = await fetch(`${BASE_URL}/polls/${pollId}`, {
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch poll");
    return res.json();
  },


createPoll: async (
  token: string,
  data: { title: string; description: string; options: { text: string }[] }
) => {
  const res = await fetch(`${BASE_URL}/polls/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create poll failed:", errorText);
    throw new Error("Failed to create poll");
  }

  return res.json();
},
// ----- VOTES -----
vote: async (token: string, pollId: string, optionId: string) => {
  const res = await fetch(`${BASE_URL}/votes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ poll_id: pollId, option_id: optionId }),
  });
  if (!res.ok) throw new Error("Failed to vote");
  return res.json();
},

// ----- LIKES -----
likePoll: async (token: string, pollId: string) => {
  const res = await fetch(`${BASE_URL}/likes/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ poll_id: pollId }),
  });
  if (!res.ok) throw new Error("Failed to like poll");
  return res.json();
},

};
