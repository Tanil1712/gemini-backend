
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import admin from "firebase-admin";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

dotenv.config();

// 🔹 Firebase setup
if (!process.env.SERVICE_ACCOUNT_JSON) {
throw new Error("Missing Firebase credentials");
}

const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// 🔒 Rate limiting (protect API)
const limiter = rateLimit({
windowMs: 60 * 1000,
max: 30,
});
app.use(limiter);

const PORT = process.env.PORT || 9000;

// 🔥 AMARA PERSONALITY SYSTEM PROMPT
const buildAmaraPrompt = (prompt) => {
return `
You are Amara, the AI academic sidekick for Zimbabwean students.

PERSONALITY:

You are like a brilliant older cousin: warm, funny, supportive

You NEVER make students feel stupid

You are confident, slightly playful, and encouraging

You understand Zimbabwe (ZESA, load shedding, school pressure)

You sometimes use light humor and emojis 😊


TEACHING STYLE:

Explain step-by-step in simple language

Give examples when needed

Focus on understanding, not memorizing

Keep answers clear and not too long


EXAM FOCUS:

You know ZIMSEC and Cambridge IGCSE

Highlight keywords that earn marks

Help students think like examiners


RULES:

Be conversational, not robotic

Do NOT overuse emojis

End naturally (you may ask if they need more help)


Student question: ${prompt}
`;
};

// 🔹 Gemini AI function
const callGemini = async (prompt) => {
try {
const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
{
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
contents: [
{
parts: [{ text: buildAmaraPrompt(prompt) }],
},
],
}),
}
);

const data = await res.json();

return (
data?.candidates?.[0]?.content?.parts?.[0]?.text || null
);
} catch (error) {
console.log("Gemini error:", error);
return null;
}
};

// 🔹 Clean question key
const cleanQuestion = (text) => {
return text
.trim()
.toLowerCase()
.replace(/[^\w\s]/g, "");
};

// 🔹 /ask endpoint
app.post("/ask", async (req, res) => {
const { prompt } = req.body;

// ✅ Input validation
if (!prompt || prompt.trim().length === 0) {
return res.status(400).json({ error: "Prompt required" });
}

if (prompt.length > 500) {
return res.status(400).json({ error: "Prompt too long" });
}

try {
console.log("Question:", prompt);

const cleanKey = cleanQuestion(prompt);
const docRef = db.collection("popular_questions").doc(cleanKey);
const docSnap = await docRef.get();

// ⚡ CACHE: return existing answer
if (docSnap.exists) {
await docRef.update({
count: admin.firestore.FieldValue.increment(1),
});

return res.json({ answer: docSnap.data().answer });
}

// 🔥 Call Gemini only if not cached
const answer = await callGemini(prompt);

if (!answer) {
return res.status(500).json({
answer: "Network issue 😬 Try again",
});
}

// 💾 Save new question
await docRef.set({
question: prompt,
answer,
count: 1,
createdAt: admin.firestore.FieldValue.serverTimestamp(),
});

res.json({ answer: answer.slice(0, 2000) });

} catch (error) {
console.log("ASK endpoint error:", error);
res.status(500).json({ answer: "Server error 😬" });
}
});

// 🔹 /popular endpoint
app.get("/popular", async (req, res) => {
try {
const snapshot = await db
.collection("popular_questions")
.orderBy("count", "desc")
.limit(50)
.get();

const data = snapshot.docs.map((doc) => doc.data());

res.json(data);
} catch (error) {
console.log("POPULAR endpoint error:", error);
res.status(500).json([]);
}
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});