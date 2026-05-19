const asyncHandler = require("../middleware/asyncHandler");
const Genre = require("../models/Genre");

const getGenres = asyncHandler(async (_req, res) => {
  res.json(await Genre.find().sort("name"));
});

const createGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.create({ name: req.body.name, description: req.body.description });
  res.status(201).json(genre);
});

const updateGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name, description: req.body.description },
    { new: true, runValidators: true }
  );
  if (!genre) {
    res.status(404);
    throw new Error("Genre not found");
  }
  res.json(genre);
});

const deleteGenre = asyncHandler(async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre) {
    res.status(404);
    throw new Error("Genre not found");
  }
  res.json({ message: "Genre deleted" });
});

module.exports = { getGenres, createGenre, updateGenre, deleteGenre };
