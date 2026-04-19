
import { db } from "../config/firebase.js";
import { callGemini } from "../config/gemini.js";

// 🔵 Generate AI Discover post
export const generateDiscoverPost = async () => {
  try {
    // 🔥 Get latest posts
    const snapshot = await db
      .collection("posts")
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();

    const posts = snapshot.docs.map((doc) => doc.data());

    if (posts.length === 0) {
      console.log("No posts found for AI generation");
      return;
    }

    // 🔥 Build prompt
    const prompt = `
You are an AI creating content for a student Discover Feed.

Based on these posts:
${JSON.stringify(posts)}

Create ONE short engaging post:
- max 3 lines
- student friendly
- motivational or interesting
- simple English
`;

    // 🤖 Call Gemini
    const aiText = await callGemini(prompt);

    if (!aiText) {
      console.log("AI returned no content");
      return;
    }

    // 💾 Save to Firestore
    await db.collection("ai_posts").add({
      text: aiText,
      type: "ai",
      createdAt: new Date(),
    });

    console.log("✅ AI Discover post created");

  } catch (error) {
    console.log("Discover AI error:", error.message);
  }
};