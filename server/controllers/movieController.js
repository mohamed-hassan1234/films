const asyncHandler = require("../middleware/asyncHandler");
const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const Watchlist = require("../models/Watchlist");
const Genre = require("../models/Genre");
const { toArray, pickUploadUrls, compact } = require("../utils/contentHelpers");

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const moviePayload = (req) => {
  const uploads = compact(pickUploadUrls(req));
  const shortDescription = req.body.shortDescription || req.body.description;
  const fullDescription = req.body.fullDescription || req.body.description || shortDescription;
  const genreIds = toArray(req.body.genres || req.body.genreId);
  const genreLabel = req.body.genre || req.body.genreName;
  const ageRating = req.body.ageRating || req.body.maturityLevel;
  const imdbRating = Number(req.body.imdbRating || req.body.rating || 7);

  return compact({
    title: req.body.title,
    description: fullDescription || shortDescription,
    shortDescription,
    fullDescription,
    genre: genreLabel,
    genres: genreIds,
    cast: toArray(req.body.cast),
    actors: toArray(req.body.actors),
    director: req.body.director,
    writer: req.body.writer,
    productionCompany: req.body.productionCompany,
    duration: Number(req.body.duration || 0),
    releaseYear: Number(req.body.releaseYear),
    language: req.body.language,
    country: req.body.country,
    rating: imdbRating,
    imdbRating,
    maturityLevel: ageRating,
    ageRating,
    featured: req.body.featured === "true" || req.body.featured === true,
    trending: req.body.trending === "true" || req.body.trending === true,
    trendingRank: Number(req.body.trendingRank || 0),
    status: req.body.status,
    poster: uploads.poster || req.body.posterUrl || req.body.poster,
    banner: uploads.banner || req.body.bannerUrl || req.body.banner,
    thumbnail: uploads.thumbnail || req.body.thumbnailUrl || req.body.thumbnail,
    posterUrl: uploads.posterUrl || req.body.posterUrl || req.body.poster,
    bannerUrl: uploads.bannerUrl || req.body.bannerUrl || req.body.banner,
    thumbnailUrl: uploads.thumbnailUrl || req.body.thumbnailUrl || req.body.thumbnail,
    videoUrl: uploads.videoUrl || req.body.videoUrl,
    ...uploads
  });
};

const getMovies = asyncHandler(async (req, res) => {
  const { search, genre, year, featured, trending, limit = 60, page } = req.query;
  const query = {};
  const isAdminCatalog = req.user?.role === "admin";
  if (!isAdminCatalog) query.status = "published";
  if (search) query.$text = { $search: search };
  if (genre) {
    const genreFilters = [{ genre: new RegExp(`^${escapeRegex(genre)}$`, "i") }];
    if (mongoose.Types.ObjectId.isValid(genre)) {
      genreFilters.push({ genres: genre });
    } else {
      const matchedGenres = await Genre.find({ name: new RegExp(`^${escapeRegex(genre)}$`, "i") }).select("_id");
      if (matchedGenres.length) genreFilters.push({ genres: { $in: matchedGenres.map((item) => item._id) } });
    }
    query.$or = genreFilters;
  }
  if (year) query.releaseYear = Number(year);
  if (featured) query.featured = featured === "true";
  if (trending) query.trending = trending === "true";
  const numericLimit = Number(limit);
  const numericPage = Number(page || 1);
  const movies = await Movie.find(query)
    .populate("genres")
    .sort(trending ? { trendingRank: 1 } : { createdAt: -1 })
    .skip(page ? (numericPage - 1) * numericLimit : 0)
    .limit(numericLimit);

  if (page) {
    const total = await Movie.countDocuments(query);
    return res.json({ movies, total, page: numericPage, pages: Math.ceil(total / numericLimit) || 1 });
  }

  res.json(movies);
});

const getMovieById = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.user?.role !== "admin") query.status = "published";
  const movie = await Movie.findOne(query).populate("genres");
  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }
  const similarQuery = { _id: { $ne: movie._id }, genres: { $in: movie.genres.map((g) => g._id) } };
  if (req.user?.role !== "admin") similarQuery.status = "published";
  const similar = await Movie.find(similarQuery)
    .populate("genres")
    .limit(10);
  res.json({ ...movie.toObject(), similar });
});

const createMovie = asyncHandler(async (req, res) => {
  const payload = moviePayload(req);
  if (!payload.genres?.length) {
    res.status(400);
    throw new Error("Choose a genre before saving the movie.");
  }
  if (payload.status !== "draft" && !payload.videoUrl) {
    res.status(400);
    throw new Error("Upload a movie video file before publishing.");
  }
  const movie = await Movie.create(payload);
  res.status(201).json(await movie.populate("genres"));
});

const updateMovie = asyncHandler(async (req, res) => {
  const existing = await Movie.findById(req.params.id);
  if (!existing) {
    res.status(404);
    throw new Error("Movie not found");
  }

  const payload = moviePayload(req);
  if (payload.genres && !payload.genres.length) {
    res.status(400);
    throw new Error("Choose a genre before saving the movie.");
  }
  [
    ["poster", "posterUrl", "removeposter"],
    ["banner", "bannerUrl", "removebanner"],
    ["thumbnail", "thumbnailUrl", "removethumbnail"],
    ["videoUrl", "videoUrl", "removevideo"]
  ].forEach(([modernField, legacyField, removeKey]) => {
    if (req.body[removeKey] === "true" || req.body[removeKey] === true) {
      payload[modernField] = "";
      payload[legacyField] = "";
    }
  });

  const nextStatus = payload.status || existing.status;
  const nextVideoUrl = payload.videoUrl ?? existing.videoUrl;
  if (nextStatus !== "draft" && !nextVideoUrl) {
    res.status(400);
    throw new Error("Upload a movie video file before publishing.");
  }

  const movie = await Movie.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  }).populate("genres");
  res.json(movie);
});

const deleteMovie = asyncHandler(async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) {
    res.status(404);
    throw new Error("Movie not found");
  }
  await Watchlist.deleteMany({ content: req.params.id, contentType: "Movie" });
  res.json({ message: "Movie deleted" });
});

module.exports = { getMovies, getMovieById, createMovie, updateMovie, deleteMovie };
