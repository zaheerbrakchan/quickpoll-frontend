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

login: async (username: string, password: string) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // ❌ Handle invalid credentials or server errors gracefully
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        error: errorData.detail || "Invalid username or password",
      };
    }

    // ✅ Success — return parsed JSON
    return await res.json();
  } catch (err) {
    console.error("API login error:", err);
    return {
      error: "Network error. Please check your connection and try again.",
    };
  }
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


// Fetch if the current user already voted in a poll

getUserVote: async (token: string, pollId: string) => {
  const res = await fetch(`${BASE_URL}/votes/user/${pollId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch user vote");
  return res.json(); // returns { voted: true/false, option_id?: string }
},

// ----- LIKES -----
likePoll: async (token: string, pollId: string) => {
    console.log("🔍 token sent to getUserLike:", token);
  // POST to /likes/{pollId} (no body required)
  const res = await fetch(`${BASE_URL}/likes/${pollId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json(); // expected { liked: bool, likes: number }
},

getUserLike: async (token: string, pollId: string) => {
    console.log("🔍 token sent to getUserLike:", token);

  const res = await fetch(`${BASE_URL}/likes/user/${pollId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch like status");
  return res.json(); // expected { liked: bool }
},



};
