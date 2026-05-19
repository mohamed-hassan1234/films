const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Movie = require("../models/Movie");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const fields = [
  ["poster", "posters"],
  ["posterUrl", "posters"],
  ["banner", "banners"],
  ["bannerUrl", "banners"],
  ["thumbnail", "thumbnails"],
  ["thumbnailUrl", "thumbnails"],
  ["videoUrl", "movies"],
  ["trailerUrl", "movies"]
];

const normalize = (value, folder) => {
  if (!value || typeof value !== "string") return value;
  const trimmed = value.trim();
  const uploadIndex = trimmed.indexOf("/uploads/");
  if (uploadIndex >= 0) return trimmed.slice(uploadIndex);
  if (trimmed.startsWith("uploads/")) return `/${trimmed}`;
  if (trimmed.startsWith("/uploads/")) return trimmed;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/")) return trimmed;
  return `/uploads/${folder}/${trimmed}`;
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/streamwave");
  const movies = await Movie.find();
  let changed = 0;

  for (const movie of movies) {
    let dirty = false;
    for (const [field, folder] of fields) {
      const next = normalize(movie[field], folder);
      if (next !== movie[field]) {
        movie[field] = next;
        dirty = true;
      }
    }

    if (dirty) {
      await movie.save();
      changed += 1;
    }
  }

  console.log(`Media URL normalization complete. Updated ${changed} movie record(s).`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(`Media URL normalization failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
