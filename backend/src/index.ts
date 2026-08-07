import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import chatRoute from "./routes/chat";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("chatRoute", chatRoute);
console.log("type =", typeof chatRoute);
app.use("/chat", chatRoute);

app.get("/", (_, res) => {
  res.json({
    message: "Aura backend is alive!",
  });
});

app.listen(3000, () => {
  console.log("🚀 Aura backend running");
});