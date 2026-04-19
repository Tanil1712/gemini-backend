
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

import askRoutes from "./src/routes/askRoutes.js";
import { startDiscoverCron } from "./src/jobs/discoverCron.js";
dotenv.config();

const app = express();

// 🔹 Middleware
app.use(cors());
app.use(express.json());


const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use(limiter);


app.use("/", askRoutes);

startDiscoverCron();
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});