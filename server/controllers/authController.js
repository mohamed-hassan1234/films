const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const Profile = require("../models/Profile");
const generateToken = require("../utils/token");

const userPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  blocked: user.blocked,
  approvalStatus: user.approvalStatus || "approved",
  token
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) {
    res.status(400);
    throw new Error("Name, valid email, and a 6+ character password are required");
  }

  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409);
    throw new Error("Email is already registered");
  }

  const user = await User.create({ name, email, password, approvalStatus: "pending" });
  await Profile.create({ user: user._id, name, isKids: false });
  res.status(201).json({
    message: "Registration submitted. An admin must approve your account before you can sign in.",
    approvalStatus: user.approvalStatus
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)) || user.blocked) {
    res.status(401);
    throw new Error("Invalid credentials");
  }
  if (user.role !== "admin" && user.approvalStatus === "pending") {
    res.status(403);
    throw new Error("Your account is waiting for admin approval.");
  }
  if (user.role !== "admin" && user.approvalStatus === "rejected") {
    res.status(403);
    throw new Error("Your registration was not approved by admin.");
  }
  res.json(userPayload(user, generateToken(user._id)));
});

const me = asyncHandler(async (req, res) => {
  const profiles = await Profile.find({ user: req.user._id }).sort("createdAt");
  res.json({ user: req.user, profiles });
});

module.exports = { register, login, me };
