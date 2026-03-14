import cors from "cors";
import express from "express";
import "dotenv/config";
import auth from "./routes/auth.js";
import secrets from "./routes/secrets.js";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.get("/health", (req, res) => {
  res.status(200).json({
    message: "SERVICE IS HEALTHY",
  });
});
//routes biinding
app.use("/api/auth", auth);
app.use("/api/secrets", secrets);
app.listen(PORT, () => {
  console.log("server is listening on port 5000");
});
