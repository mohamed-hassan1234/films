const asyncHandler = require("../middleware/asyncHandler");
const Series = require("../models/Series");
const Season = require("../models/Season");
const Episode = require("../models/Episode");
const Watchlist = require("../models/Watchlist");
const { toArray, pickUploadUrls, compact } = require("../utils/contentHelpers");

const seriesPayload = (req) => {
  const uploads = pickUploadUrls(req);
  return compact({
    title: req.body.title,
    description: req.body.description,
    genres: toArray(req.body.genres),
    cast: toArray(req.body.cast),
    releaseYear: Number(req.body.releaseYear),
    rating: Number(req.body.rating || 7),
    maturityLevel: req.body.maturityLevel,
    featured: req.body.featured === "true" || req.body.featured === true,
    trending: req.body.trending === "true" || req.body.trending === true,
    trendingRank: Number(req.body.trendingRank || 0),
    ...uploads
  });
};

const getSeries = asyncHandler(async (req, res) => {
  const { search, genre, featured, trending, limit = 60 } = req.query;
  const query = {};
  if (search) query.$text = { $search: search };
  if (genre) query.genres = genre;
  if (featured) query.featured = featured === "true";
  if (trending) query.trending = trending === "true";
  const items = await Series.find(query)
    .populate("genres")
    .sort(trending ? { trendingRank: 1 } : { createdAt: -1 })
    .limit(Number(limit));
  res.json(items);
});

const getSeriesById = asyncHandler(async (req, res) => {
  const series = await Series.findById(req.params.id).populate("genres");
  if (!series) {
    res.status(404);
    throw new Error("Series not found");
  }
  const seasons = await Season.find({ series: series._id }).sort("seasonNumber");
  const episodes = await Episode.find({ series: series._id }).sort("episodeNumber");
  const similar = await Series.find({ _id: { $ne: series._id }, genres: { $in: series.genres.map((g) => g._id) } })
    .populate("genres")
    .limit(10);
  res.json({ ...series.toObject(), seasons, episodes, similar });
});

const createSeries = asyncHandler(async (req, res) => {
  const series = await Series.create(seriesPayload(req));
  res.status(201).json(await series.populate("genres"));
});

const updateSeries = asyncHandler(async (req, res) => {
  const series = await Series.findByIdAndUpdate(req.params.id, seriesPayload(req), {
    new: true,
    runValidators: true
  }).populate("genres");
  if (!series) {
    res.status(404);
    throw new Error("Series not found");
  }
  res.json(series);
});

const deleteSeries = asyncHandler(async (req, res) => {
  const series = await Series.findByIdAndDelete(req.params.id);
  if (!series) {
    res.status(404);
    throw new Error("Series not found");
  }
  await Season.deleteMany({ series: req.params.id });
  await Episode.deleteMany({ series: req.params.id });
  await Watchlist.deleteMany({ content: req.params.id, contentType: "Series" });
  res.json({ message: "Series deleted" });
});

const addSeason = asyncHandler(async (req, res) => {
  const season = await Season.create({
    series: req.params.id,
    seasonNumber: Number(req.body.seasonNumber),
    title: req.body.title || ""
  });
  res.status(201).json(season);
});

const addEpisode = asyncHandler(async (req, res) => {
  const urls = pickUploadUrls(req);
  const episode = await Episode.create({
    series: req.params.id,
    season: req.body.season,
    episodeNumber: Number(req.body.episodeNumber),
    title: req.body.title,
    description: req.body.description,
    duration: Number(req.body.duration || 0),
    thumbnailUrl: urls.thumbnailUrl,
    videoUrl: urls.videoUrl
  });
  res.status(201).json(episode);
});

module.exports = {
  getSeries,
  getSeriesById,
  createSeries,
  updateSeries,
  deleteSeries,
  addSeason,
  addEpisode
};
