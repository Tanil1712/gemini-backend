import fetch from "node-fetch";

// 🔥 Central Gemini call (used everywhere)
export const callGemini = async (prompt) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await res.json();

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn’t generate a response right now."
    );

  } catch (error) {
    console.log("Gemini error:", error.message);
    return "Network issue 😬 Try again.";
  }
};