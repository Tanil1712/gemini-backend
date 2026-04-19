
import express from "express";
import { askQuestion, getPopularQuestions } from "../controllers/askController.js";

const router = express.Router();

// 🔥 Routes
router.post("/ask", askQuestion);
router.get("/popular", getPopularQuestions);

export default router;