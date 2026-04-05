import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import askRoute from "./routes/ask.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/ask", askRoute);

app.get("/", (req, res) => {
res.send("Amara AI Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});

