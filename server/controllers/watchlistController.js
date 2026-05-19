const asyncHandler = require("../middleware/asyncHandler");
const Watchlist = require("../models/Watchlist");

const getWatchlist = asyncHandler(async (req, res) => {
  const items = await Watchlist.find({ user: req.user._id, profile: req.query.profile || undefined })
    .populate("content")
    .sort("-createdAt");
  res.json(items);
});

const addToWatchlist = asyncHandler(async (req, res) => {
  const item = await Watchlist.findOneAndUpdate(
    {
      user: req.user._id,
      profile: req.body.profile || undefined,
      content: req.params.contentId,
      contentType: req.body.contentType || "Movie"
    },
    {},
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).populate("content");
  res.status(201).json(item);
});

const removeFromWatchlist = asyncHandler(async (req, res) => {
  await Watchlist.deleteMany({ user: req.user._id, content: req.params.contentId });
  res.json({ message: "Removed from watchlist" });
});

module.exports = { getWatchlist, addToWatchlist, removeFromWatchlist };
