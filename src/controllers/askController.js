
import { db, admin } from "../config/firebase.js";
import { getAmaraResponse } from "../services/amaraService.js";

const cleanQuestion = (text) => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "");
};


export const askQuestion = async (req, res) => {
  const { prompt } = req.body;

  
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

    if (docSnap.exists) {
      await docRef.update({
        count: admin.firestore.FieldValue.increment(1),
      });

      return res.json({ answer: docSnap.data().answer });
    }

    
    const answer = await getAmaraResponse(prompt);

    if (!answer) {
      return res.status(500).json({
        answer: "Amara is thinking 🤔 Try again",
      });
    }


    await docRef.set({
      question: prompt,
      answer,
      count: 1,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ answer });

  } catch (error) {
    console.log("ASK error:", error);
    res.status(500).json({ answer: "Server error 😬" });
  }
};


export const getPopularQuestions = async (req, res) => {
  try {
    const snapshot = await db
      .collection("popular_questions")
      .orderBy("count", "desc")
      .limit(50)
      .get();

    const data = snapshot.docs.map((doc) => doc.data());

    res.json(data);

  } catch (error) {
    console.log("POPULAR error:", error);
    res.status(500).json([]);
  }
};