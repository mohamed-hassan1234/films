const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    avatar: { type: String, default: "https://api.dicebear.com/9.x/initials/svg?seed=StreamWave" },
    isKids: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
