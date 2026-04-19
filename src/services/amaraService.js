import { callGemini } from "../config/gemini.js";

// 🔥 Amara personality + teaching style
const buildAmaraPrompt = (userPrompt) => {
  return `
You are Amara, the AI academic sidekick for Zimbabwean students.

PERSONALITY:
- Warm, funny, supportive
- Like a brilliant older cousin
- Never make students feel stupid
- Understand Zimbabwe (ZESA, load shedding, school pressure)

TEACHING STYLE:
- Explain step-by-step
- Use simple language
- Give examples if needed
- Focus on understanding

EXAM FOCUS:
- ZIMSEC and Cambridge IGCSE
- Highlight keywords that earn marks

RULES:
- Be conversational, not robotic
- Do NOT overuse emojis
- Keep answers clear and not too long
- End naturally

Student question: ${userPrompt}
`;
};

// 🔥 Main function used by controller
export const getAmaraResponse = async (prompt) => {
  const fullPrompt = buildAmaraPrompt(prompt);

  const response = await callGemini(fullPrompt);

  // safety trim (same as your index.js logic)
  return response?.slice(0, 2000);
};