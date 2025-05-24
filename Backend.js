// Basic Node.js + Express backend for EngageNG
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
require("dotenv\config");

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = "engageng_secret";

app.use(cors());
app.use(express.json());

const users = [];
const tasks = [];

const auth = (role) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== role) return res.status(403).json({ message: "Forbidden" });
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.post("/api/register/:role", (req, res) => {
  const { email, password } = req.body;
  const { role } = req.params;
  if (users.find((u) => u.email === email)) return res.status(400).json({ message: "User exists" });
  users.push({ email, password, role });
  res.status(201).json({ message: "Registered" });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: "Invalid credentials" });
  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: "1h" });
  res.json({ token, role: user.role });
});

app.post("/api/client/tasks", auth("client"), (req, res) => {
  const { type, url } = req.body;
  tasks.push({ type, url });
  res.status(201).json({ message: "Task created" });
});

const upload = multer({ dest: "uploads/" });
app.post("/api/user/proof", auth("user"), upload.single("proof"), (req, res) => {
  const { comments } = req.body;
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });
  res.status(200).json({ message: "Proof uploaded", filename: file.filename, comments });
});

app.listen(PORT, () => console.log(`EngageNG backend running on http://localhost:${PORT}`));
