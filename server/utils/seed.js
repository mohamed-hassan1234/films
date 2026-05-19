const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Genre = require("../models/Genre");
const Movie = require("../models/Movie");
const Series = require("../models/Series");
const Season = require("../models/Season");
const Episode = require("../models/Episode");
const Watchlist = require("../models/Watchlist");
const WatchHistory = require("../models/WatchHistory");
const Review = require("../models/Review");

dotenv.config();

const img = (title, size = "600x900", color = "151515") =>
  `https://placehold.co/${size}/${color}/ffffff?text=${encodeURIComponent(title)}`;

const commons = (file, width) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}${width ? `?width=${width}` : ""}`;

const genres = [
  "Action",
  "Comedy",
  "Drama",
  "Documentary",
  "Anime",
  "Kids",
  "Sci-Fi",
  "Thriller"
];

const movieSeeds = [
  {
    title: "His Girl Friday",
    description: "A fast-talking editor tries to win back his ace reporter as a breaking story turns the newsroom upside down.",
    genres: ["Comedy", "Drama"],
    releaseYear: 1940,
    duration: 92,
    rank: 1,
    rating: 7.8,
    maturityLevel: "7+",
    cast: ["Cary Grant", "Rosalind Russell", "Ralph Bellamy"],
    director: "Howard Hawks",
    posterUrl: commons("His Girl Friday (1940 poster).jpg", 700),
    bannerUrl: commons("His Girl Friday 5.jpg", 1400),
    thumbnailUrl: commons("His Girl Friday 5.jpg", 640),
    videoUrl: ""
  },
  {
    title: "Charade",
    description: "A Paris mystery twists romance, danger, and mistaken identity into one elegant chase.",
    genres: ["Comedy", "Drama", "Thriller"],
    releaseYear: 1963,
    duration: 113,
    rank: 2,
    rating: 7.9,
    cast: ["Cary Grant", "Audrey Hepburn", "Walter Matthau"],
    director: "Stanley Donen",
    posterUrl: commons("Charade (1963 poster).jpg", 700),
    bannerUrl: commons("Charade (1963 poster).jpg", 1400),
    thumbnailUrl: commons("Charade (1963 poster).jpg", 640),
    videoUrl: commons("Charade (1963).webm")
  },
  {
    title: "The Stranger",
    description: "A federal investigator follows a fugitive war criminal into a quiet town with dangerous secrets.",
    genres: ["Drama", "Thriller"],
    releaseYear: 1946,
    duration: 95,
    rank: 3,
    rating: 7.3,
    cast: ["Edward G. Robinson", "Loretta Young", "Orson Welles"],
    director: "Orson Welles",
    posterUrl: commons("The Stranger (1946 film poster).jpg", 700),
    bannerUrl: commons("The Stranger 1946.jpg", 1400),
    thumbnailUrl: commons("The Stranger 1946.jpg", 640)
  },
  {
    title: "Detour",
    description: "A hitchhiking pianist is pulled into a fatal noir spiral on a lonely road west.",
    genres: ["Drama", "Thriller"],
    releaseYear: 1945,
    duration: 68,
    rank: 4,
    rating: 7.3,
    cast: ["Tom Neal", "Ann Savage", "Claudia Drake"],
    director: "Edgar G. Ulmer",
    posterUrl: commons("Detour (poster).jpg", 700),
    bannerUrl: commons("Detour (poster).jpg", 1400),
    thumbnailUrl: commons("Detour (poster).jpg", 640),
    videoUrl: commons("Detour (1945) by Edgar G. Ulmer.webm")
  },
  {
    title: "Plan 9 from Outer Space",
    description: "Aliens attempt to stop humanity by raising the dead in a cult sci-fi midnight classic.",
    genres: ["Sci-Fi", "Thriller"],
    releaseYear: 1959,
    duration: 79,
    rank: 5,
    rating: 6.1,
    cast: ["Gregory Walcott", "Mona McKinnon", "Duke Moore"],
    director: "Ed Wood",
    posterUrl: commons("Plan 9 from Outer Space, poster, gtfy.07034.jpg", 700),
    bannerUrl: commons("Plan 9 from Outer Space, poster, gtfy.07034.jpg", 1400),
    thumbnailUrl: commons("Plan 9 from Outer Space, poster, gtfy.07034.jpg", 640),
    videoUrl: commons("Plan 9 from Outer Space 1959 640 x 480.webm")
  },
  {
    title: "Night of the Living Dead",
    description: "Strangers barricade themselves in a farmhouse as a night of panic closes in around them.",
    genres: ["Thriller"],
    releaseYear: 1968,
    duration: 96,
    rank: 6,
    rating: 7.8,
    maturityLevel: "16+",
    cast: ["Duane Jones", "Judith O'Dea", "Karl Hardman"],
    director: "George A. Romero",
    posterUrl: commons("Livingdead.jpg", 700),
    bannerUrl: commons("Night of the Living Dead (1968) - Zombies.JPG", 1400),
    thumbnailUrl: commons("Night of the Living Dead-1.jpg", 640)
  },
  {
    title: "Neon Harbor",
    description: "A rescue pilot uncovers a city-wide conspiracy beneath a glowing coastal skyline.",
    genres: ["Action", "Thriller"],
    releaseYear: 2026,
    duration: 118,
    rank: 7,
    posterUrl: img("Neon Harbor", "600x900", "171717"),
    bannerUrl: img("Neon Harbor", "1400x700", "260d0d")
  },
  {
    title: "Quiet Orbit",
    description: "Astronauts on a repair mission discover a signal that changes everything.",
    genres: ["Sci-Fi", "Drama"],
    releaseYear: 2025,
    duration: 132,
    rank: 8,
    posterUrl: img("Quiet Orbit", "600x900", "221111"),
    bannerUrl: img("Quiet Orbit", "1400x700", "101010")
  },
  {
    title: "Paper Planets",
    description: "A curious child builds imaginary worlds that help a family reconnect.",
    genres: ["Kids", "Drama"],
    releaseYear: 2026,
    duration: 92,
    rank: 9,
    maturityLevel: "7+",
    posterUrl: img("Paper Planets", "600x900", "171717"),
    bannerUrl: img("Paper Planets", "1400x700", "260d0d")
  },
  {
    title: "Sky Lanterns",
    description: "An animated adventure about siblings guiding lost lanterns across a dream realm.",
    genres: ["Anime", "Kids"],
    releaseYear: 2026,
    duration: 96,
    rank: 10,
    maturityLevel: "7+",
    posterUrl: img("Sky Lanterns", "600x900", "221111"),
    bannerUrl: img("Sky Lanterns", "1400x700", "101010")
  }
];

const seriesSeeds = [
  ["Signal House", "A team of investigators decodes impossible broadcasts from abandoned places.", ["Sci-Fi", "Thriller"], 2026, 1],
  ["Corner Booth", "Workers at a late-night cafe become a chosen family across one strange year.", ["Comedy", "Drama"], 2025, 2],
  ["Atlas Kids", "Young explorers use maps, science, and courage to solve neighborhood mysteries.", ["Kids", "Anime"], 2024, 3]
];

const run = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Profile.deleteMany(),
    Genre.deleteMany(),
    Movie.deleteMany(),
    Series.deleteMany(),
    Season.deleteMany(),
    Episode.deleteMany(),
    Watchlist.deleteMany(),
    WatchHistory.deleteMany(),
    Review.deleteMany()
  ]);

  const createdGenres = await Genre.insertMany(genres.map((name) => ({ name, description: `${name} stories` })));
  const genreMap = Object.fromEntries(createdGenres.map((genre) => [genre.name, genre._id]));

  const admin = await User.create({ name: "StreamWave Admin", email: "admin@streamwave.test", password: "password123", role: "admin", approvalStatus: "approved", approvedAt: new Date() });
  const demo = await User.create({ name: "Demo Viewer", email: "user@streamwave.test", password: "password123", role: "user", approvalStatus: "approved", approvedAt: new Date(), approvedBy: admin._id });
  await Profile.insertMany([
    { user: demo._id, name: "Main", avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Main" },
    { user: demo._id, name: "Kids", isKids: true, avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Kids" },
    { user: admin._id, name: "Admin", avatar: "https://api.dicebear.com/9.x/initials/svg?seed=Admin" }
  ]);

  await Movie.insertMany(
    movieSeeds.map((movie) => ({
      title: movie.title,
      description: movie.description,
      genres: movie.genres.map((name) => genreMap[name]),
      cast: movie.cast || ["Avery Stone", "Milo Hart", "Nia Vale"],
      actors: movie.cast || ["Avery Stone", "Milo Hart", "Nia Vale"],
      director: movie.director || "StreamWave Studios",
      duration: movie.duration,
      releaseYear: movie.releaseYear,
      rating: movie.rating || 7 + (movie.rank % 3) * 0.4,
      maturityLevel: movie.maturityLevel || (movie.genres.includes("Kids") ? "7+" : "13+"),
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      thumbnailUrl: movie.thumbnailUrl || movie.bannerUrl || img(movie.title, "640x360", "202020"),
      videoUrl: movie.videoUrl || "",
      trailerUrl: "",
      featured: movie.rank === 1,
      trending: true,
      trendingRank: movie.rank,
      views: Math.floor(900 / movie.rank)
    }))
  );

  for (const [title, description, names, releaseYear, rank] of seriesSeeds) {
    const series = await Series.create({
      title,
      description,
      genres: names.map((name) => genreMap[name]),
      cast: ["Jules Rivers", "Kai Mercer", "Lena Cross"],
      releaseYear,
      rating: 8,
      maturityLevel: names.includes("Kids") ? "7+" : "13+",
      posterUrl: img(title, "600x900", "181818"),
      bannerUrl: img(title, "1400x700", "150909"),
      thumbnailUrl: img(title, "640x360", "202020"),
      featured: rank === 1,
      trending: true,
      trendingRank: rank + 10,
      views: 500 - rank * 30
    });
    const season = await Season.create({ series: series._id, seasonNumber: 1, title: "Season 1" });
    await Episode.insertMany(
      [1, 2, 3].map((num) => ({
        series: series._id,
        season: season._id,
        episodeNumber: num,
        title: `Episode ${num}`,
        description: `${title} chapter ${num}.`,
        duration: 42,
        thumbnailUrl: img(`${title} E${num}`, "640x360", "242424")
      }))
    );
  }

  console.log("Seed complete");
  console.log("Admin: admin@streamwave.test / password123");
  console.log("User: user@streamwave.test / password123");
  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
