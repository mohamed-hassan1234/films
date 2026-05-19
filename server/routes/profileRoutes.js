const express = require("express");
const { getProfiles, createProfile, updateProfile, deleteProfile } = require("../controllers/profileController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);
router.route("/").get(getProfiles).post(createProfile);
router.route("/:id").put(updateProfile).delete(deleteProfile);

module.exports = router;
