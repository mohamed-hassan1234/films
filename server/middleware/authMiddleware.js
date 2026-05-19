const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, token missing");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
  const user = await User.findById(decoded.id).select("-password");
  if (!user || user.blocked) {
    res.status(401);
    throw new Error("Not authorized");
  }
  if (user.role !== "admin" && user.approvalStatus && user.approvalStatus !== "approved") {
    res.status(403);
    throw new Error("Account approval required");
  }

  req.user = user;
  next();
});

const admin = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  res.status(403);
  next(new Error("Admin access required"));
};

module.exports = { protect, admin };
