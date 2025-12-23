import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

// 🎯 Route for chatbot queries
app.post("/chat", (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  // Call Python script (voice_assistant.py)
  const python = spawn("python", ["voice_assistant.py", "--text", query]);

  let output = "";
  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error(`Python error: ${data}`);
  });

  python.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "Python script failed" });
    }
    res.json({ reply: output.trim() });
  });
});

// Run backend
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Node.js backend running at http://localhost:${PORT}`);
});
