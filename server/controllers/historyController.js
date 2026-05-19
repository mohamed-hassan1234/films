const asyncHandler = require("../middleware/asyncHandler");
const WatchHistory = require("../models/WatchHistory");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Episode = require("../models/Episode");

const saveProgress = asyncHandler(async (req, res) => {
  const { contentId, contentType = "Movie", profile, progress = 0, duration = 0 } = req.body;
  if (!contentId) {
    res.status(400);
    throw new Error("contentId is required");
  }
  const completed = duration > 0 && Number(progress) / Number(duration) > 0.9;
  const filter = { user: req.user._id, profile: profile || undefined, content: contentId, contentType };
  const existing = await WatchHistory.findOne(filter).select("_id");
  const item = await WatchHistory.findOneAndUpdate(
    filter,
    { progress, duration, completed, lastWatchedAt: Date.now() },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).populate("content");

  if (!existing) {
    const model = contentType === "Series" ? Series : contentType === "Episode" ? Episode : Movie;
    await model.findByIdAndUpdate(contentId, { $inc: { views: 1 } });
  }
  res.json(item);
});

const continueWatching = asyncHandler(async (req, res) => {
  const query = { user: req.user._id, completed: false };
  if (req.query.profile) query.profile = req.query.profile;
  const items = await WatchHistory.find(query).populate("content").sort("-lastWatchedAt").limit(20);
  res.json(items);
});

module.exports = { saveProgress, continueWatching };
