import express from "express";
import db from "../firebase.js";
import { askGemini } from "../services/gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
try {
let { question, subject } = req.body;

if (!question) {
return res.status(400).json({ error: "Question is required" });
}

// Clean question
const cleanQuestion = question.toLowerCase().trim();

// 🔍 1. Check Firebase first
const snapshot = await db
.collection("questions")
.where("question", "==", cleanQuestion)
.get();

if (!snapshot.empty) {
const data = snapshot.docs[0].data();

return res.json({
answer: data.answer,
source: "firebase",
});
}

// 🤖 2. Ask Gemini
const aiAnswer = await askGemini(question);

// 💾 3. Save to Firebase
await db.collection("questions").add({
question: cleanQuestion,
originalQuestion: question,
answer: aiAnswer,
subject: subject || "general",
createdAt: new Date(),
});

// 📤 4. Return answer
res.json({
answer: aiAnswer,
source: "ai",
});

} catch (error) {
console.error("Error:", error);
res.status(500).json({ error: "Server error" });
}
});

export default router;
