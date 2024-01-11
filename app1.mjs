import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
mongoose.connect(
  "mongodb+srv://travalapp:travalapp@cluster0.oz5xxmc.mongodb.net/",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Define the CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Define the Swiggy API proxy route
app.use(
  "/api/proxy/swiggy/mapi",
  createProxyMiddleware({
    target: "https://www.swiggy.com",
    changeOrigin: true,
    pathRewrite: {
      "^/api/proxy/swiggy/mapi": "/mapi",
    },
  })
);
const reasturentUser = new mongoose.Schema({
  name: String,
  password: String,
  gmail: String,
});
const User = mongoose.model("reasturentUser", reasturentUser);

app.post("/create/users", async (req, res) => {
  const { name, password, gmail } = req.body;

  // Basic validation (you should add more)
  if (!name || !password || !gmail) {
    return res
      .status(400)
      .json({ error: "Invalid request. Missing required fields." });
  }

  // Create a new user and save it to MongoDB
  const newUser = new User({ name, password, gmail });

  try {
    const savedUser = await newUser.save();
    return res
      .status(201)
      .json({ message: "User created successfully.", user: savedUser });
  } catch (error) {
    return res.status(500).json({ error: "Failed to create user." });
  }
});

app.post("/api/login", async (req, res) => {
  const { gmail, password } = req.body;

  // Basic validation (you should add more)
  if (!gmail || !password) {
    return res
      .status(400)
      .json({ error: "Invalid request. Missing required fields." });
  }

  // Find the user in the in-memory storage (replace this with database lookup)
  const user = await User.findOne({ gmail, password });
  console.log(user.name);
  if (!user) {
    return res.status(401).json({
      error: "Invalid credentials. User not found or incorrect password.",
    });
  }

  return res.status(200).json({ message: "Login successful.", user });
});

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
