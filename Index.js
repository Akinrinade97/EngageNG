const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Dummy endpoints for example:
app.post("/api/register/user", (req, res) => {
  // register user logic
  res.json({ message: "User registered successfully" });
});
app.post("/api/register/client", (req, res) => {
  // register client logic
  res.json({ message: "Client registered successfully" });
});
app.post("/api/login", (req, res) => {
  // login logic
  res.json({ token: "fake-jwt-token", role: "user" }); // or role: "client"
});

// Add other routes like /client/tasks and /user/proof

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
