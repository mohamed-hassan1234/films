const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    content: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "contentType" },
    contentType: { type: String, enum: ["Movie", "Series"], required: true }
  },
  { timestamps: true }
);

watchlistSchema.index({ user: 1, profile: 1, content: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model("Watchlist", watchlistSchema);
