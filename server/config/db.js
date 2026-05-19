const mongoose = require("mongoose");

const ensureMovieTextIndex = async () => {
  const Movie = require("../models/Movie");
  const indexes = await Movie.collection.indexes();
  const oldTextIndexes = indexes.filter(
    (index) => Object.values(index.key || {}).includes("text") && index.language_override !== "searchLanguage"
  );

  for (const index of oldTextIndexes) {
    await Movie.collection.dropIndex(index.name);
  }

  await Movie.syncIndexes();
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/streamwave");
    await ensureMovieTextIndex();
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
