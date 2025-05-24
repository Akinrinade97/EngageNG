const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// In-memory storage (use DB for production)
const users = [];   // {email, passwordHash, role}
const tasks = [];   // {id, clientEmail, type, url}
const proofs = [];  // {userEmail, taskId, comments, proofFilename}

// Middleware to verify token and set req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// Register endpoint (user or client)
app.post("/api/register/:role", async (req, res) => {
  const { email, password } = req.body;
  const role = req.params.role;

  if (!["user", "client"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  users.push({ email, passwordHash, role });
  res.json({ message: `${role} registered successfully` });
});

// Login endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ message: "User not found" });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: "Invalid password" });

  const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "6h" });
  res.json({ token, role: user.role });
});

// Client creates a task
app.post("/api/client/tasks", authenticateToken, (req, res) => {
  if (req.user.role !== "client") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { type, url } = req.body;
  if (!type || !url) {
    return res.status(400).json({ message: "Type and URL required" });
  }

  const id = tasks.length + 1;
  tasks.push({ id, clientEmail: req.user.email, type, url });
  res.json({ message: "Task created", taskId: id });
});

// User gets today's approved task (for simplicity, returns all tasks)
app.get("/api/user/tasks", authenticateToken, (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }
  // In real app, filter tasks per user, date, etc.
  res.json({ tasks });
});

// File upload setup for proofs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// User submits proof for a task
app.post("/api/user/proof", authenticateToken, upload.single("proof"), (req, res) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { comments } = req.body;
  const proofFilename = req.file ? req.file.filename : null;

  if (!proofFilename) {
    return res.status(400).json({ message: "Proof file required" });
  }

  // For demo, no taskId is passed; ideally include taskId in frontend form
  proofs.push({ userEmail: req.user.email, comments, proofFilename });
  res.json({ message: "Proof submitted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
