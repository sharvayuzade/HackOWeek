import express from "express";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import {
  issueAccessToken,
  issueRefreshToken,
  revokeRefreshToken,
  verifyRefreshToken
} from "../utils/tokens.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, email and password (min 6 chars) are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    const token = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user);
    return res.status(201).json({
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueAccessToken(user);
    const refreshToken = await issueRefreshToken(user);
    return res.status(200).json({
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const { payload, tokenRecord } = await verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: "User not found for refresh token" });
    }

    await revokeRefreshToken(tokenRecord);

    const token = issueAccessToken(user);
    const newRefreshToken = await issueRefreshToken(user, tokenRecord._id);

    return res.status(200).json({
      token,
      refreshToken: newRefreshToken,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    return res.status(401).json({ message: "Refresh failed", error: error.message });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    const { tokenRecord } = await verifyRefreshToken(refreshToken);
    await revokeRefreshToken(tokenRecord);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch {
    return res.status(200).json({ message: "Logged out successfully" });
  }
});

export default router;
