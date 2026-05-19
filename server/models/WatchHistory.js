const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    profile: { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    content: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "contentType" },
    contentType: { type: String, enum: ["Movie", "Series", "Episode"], required: true },
    progress: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

watchHistorySchema.index({ user: 1, profile: 1, content: 1, contentType: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);
