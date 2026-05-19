const asyncHandler = require("../middleware/asyncHandler");
const Profile = require("../models/Profile");

const getProfiles = asyncHandler(async (req, res) => {
  res.json(await Profile.find({ user: req.user._id }).sort("createdAt"));
});

const createProfile = asyncHandler(async (req, res) => {
  const count = await Profile.countDocuments({ user: req.user._id });
  if (count >= 5) {
    res.status(400);
    throw new Error("Maximum of 5 profiles reached");
  }
  const profile = await Profile.create({
    user: req.user._id,
    name: req.body.name,
    avatar: req.body.avatar,
    isKids: Boolean(req.body.isKids)
  });
  res.status(201).json(profile);
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { name: req.body.name, avatar: req.body.avatar, isKids: req.body.isKids },
    { new: true, runValidators: true }
  );
  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }
  res.json(profile);
});

const deleteProfile = asyncHandler(async (req, res) => {
  const total = await Profile.countDocuments({ user: req.user._id });
  if (total <= 1) {
    res.status(400);
    throw new Error("At least one profile is required");
  }
  const profile = await Profile.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!profile) {
    res.status(404);
    throw new Error("Profile not found");
  }
  res.json({ message: "Profile deleted" });
});

module.exports = { getProfiles, createProfile, updateProfile, deleteProfile };
