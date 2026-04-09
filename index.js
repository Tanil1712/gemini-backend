
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Firebase
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 9000;

// ✅ CORRECT GEMINI FUNCTION
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
parts: [{ text: prompt }],
},
],
}),
}
);

const data = await res.json();

return (
data?.candidates?.[0]?.content?.parts?.[0]?.text ||
"No answer found 🤔"
);
} catch (error) {
console.log(error);
return "Error 😬";
}
};

// ✅ ASK ENDPOINT
app.post("/ask", async (req, res) => {
const { prompt } = req.body;

if (!prompt) {
return res.status(400).json({ error: "Prompt required" });
}

try {
const answer = await callGemini(prompt);

const docRef = db.collection("popular_questions").doc(prompt.toLowerCase());
const docSnap = await docRef.get();

if (docSnap.exists) {
await docRef.update({
count: admin.firestore.FieldValue.increment(1),
});
} else {
await docRef.set({
question: prompt,
answer,
count: 1,
});
}

res.json({ answer });
} catch (error) {
console.log(error);
res.status(500).json({ answer: "Server error 😬" });
}
});

// ✅ POPULAR ENDPOINT
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
res.status(500).json([]);
}
});

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});