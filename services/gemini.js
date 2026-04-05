import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const askGemini = async (question) => {
try {
const response = await axios.post(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
{
contents: [
{
parts: [{ text: question }],
},
],
}
);

return response.data.candidates[0].content.parts[0].text;

} catch (error) {
console.error("Gemini Error:", error.response?.data || error.message);
return "Hey! I'm having a small moment 😅Give me a second and try again - i'm bot going anywhere.";
}
};