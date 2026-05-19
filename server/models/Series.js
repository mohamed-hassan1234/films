const mongoose = require("mongoose");

const seriesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    cast: [{ type: String }],
    releaseYear: { type: Number, required: true },
    rating: { type: Number, min: 0, max: 10, default: 7 },
    maturityLevel: { type: String, default: "13+" },
    posterUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    trendingRank: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

seriesSchema.index({ title: "text", description: "text", cast: "text" });

module.exports = mongoose.model("Series", seriesSchema);
