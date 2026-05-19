const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    fullDescription: { type: String, default: "" },
    genre: { type: String, default: "" },
    genres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    cast: [{ type: String }],
    actors: [{ type: String }],
    director: { type: String, default: "" },
    writer: { type: String, default: "" },
    productionCompany: { type: String, default: "" },
    duration: { type: Number, default: 0 },
    releaseYear: { type: Number, required: true },
    language: { type: String, default: "" },
    country: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 10, default: 7 },
    imdbRating: { type: Number, min: 0, max: 10, default: 7 },
    maturityLevel: { type: String, default: "13+" },
    ageRating: { type: String, default: "13+" },
    poster: { type: String, default: "" },
    banner: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    posterUrl: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    thumbnailUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    trailerUrl: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    trendingRank: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "draft"], default: "published" },
    views: { type: Number, default: 0 }
  },
  { timestamps: true }
);

movieSchema.index({
  title: "text",
  description: "text",
  shortDescription: "text",
  fullDescription: "text",
  cast: "text",
  actors: "text",
  director: "text"
}, { default_language: "none", language_override: "searchLanguage" });

module.exports = mongoose.model("Movie", movieSchema);
