const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema(
  {
    series: { type: mongoose.Schema.Types.ObjectId, ref: "Series", required: true },
    season: { type: mongoose.Schema.Types.ObjectId, ref: "Season", required: true },
    episodeNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    thumbnailUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Episode", episodeSchema);
