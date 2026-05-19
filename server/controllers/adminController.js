const asyncHandler = require("../middleware/asyncHandler");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Genre = require("../models/Genre");
const WatchHistory = require("../models/WatchHistory");

const folderSize = (folder) => {
  if (!fs.existsSync(folder)) return 0;
  return fs.readdirSync(folder, { withFileTypes: true }).reduce((total, entry) => {
    const target = path.join(folder, entry.name);
    if (entry.isDirectory()) return total + folderSize(target);
    return total + fs.statSync(target).size;
  }, 0);
};

const stats = asyncHandler(async (_req, res) => {
  const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 5120);
  const uploadLimitMb = Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : 5120;
  const uploadLimitBytes = uploadLimitMb * 1024 * 1024;
  const [totalUsers, totalMovies, totalSeries, totalGenres, recentlyAdded, mostWatched, latestUsers, draftMovies] = await Promise.all([
    User.countDocuments(),
    Movie.countDocuments(),
    Series.countDocuments(),
    Genre.countDocuments(),
    Movie.find().sort("-createdAt").limit(6).populate("genres"),
    Movie.find().sort("-views").limit(6).populate("genres"),
    User.find().select("name email role createdAt").sort("-createdAt").limit(6),
    Movie.countDocuments({ status: "draft" })
  ]);
  const uploadsPath = path.join(__dirname, "..", "uploads");
  const storageUsed = folderSize(uploadsPath);
  const uploadsThisMonth = await Movie.countDocuments({
    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
  });

  res.json({
    totalUsers,
    totalMovies,
    totalSeries,
    totalGenres,
    draftMovies,
    recentlyAdded,
    mostWatched,
    latestUsers,
    storageUsed,
    uploadLimitMb,
    uploadLimitBytes,
    uploadsThisMonth
  });
});

const users = asyncHandler(async (_req, res) => {
  res.json(await User.find().select("-password").sort("-createdAt"));
});

const updateUser = asyncHandler(async (req, res) => {
  const update = {
    role: req.body.role,
    blocked: req.body.blocked,
    name: req.body.name,
    email: req.body.email,
    approvalStatus: req.body.approvalStatus
  };
  Object.keys(update).forEach((key) => update[key] === undefined && delete update[key]);
  if (update.approvalStatus === "approved") {
    update.approvedAt = new Date();
    update.approvedBy = req.user._id;
    update.blocked = false;
  }
  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }
  res.json({ message: "User deleted" });
});

const reports = asyncHandler(async (_req, res) => {
  const [watchHistory, genreCounts, newUsers] = await Promise.all([
    WatchHistory.find().populate("user", "name email").populate("content").sort("-lastWatchedAt").limit(50),
    Movie.aggregate([
      { $unwind: "$genres" },
      { $group: { _id: "$genres", count: { $sum: 1 } } },
      { $lookup: { from: "genres", localField: "_id", foreignField: "_id", as: "genre" } },
      { $unwind: { path: "$genre", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 1, name: { $ifNull: ["$genre.name", "Uncategorized"] }, count: 1 } },
      { $sort: { count: -1, name: 1 } }
    ]),
    User.find().select("name email createdAt role").sort("-createdAt").limit(10)
  ]);
  res.json({ watchHistory, genreCounts, newUsers });
});

module.exports = { stats, users, updateUser, deleteUser, reports };
