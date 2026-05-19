const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");
const Profile = require("./models/Profile");

const adminData = {
  name: process.env.ADMIN_NAME || "StreamWave Admin",
  email: (process.env.ADMIN_EMAIL || "admin@streamwave.test").toLowerCase().trim(),
  password: process.env.ADMIN_PASSWORD || "password123"
};

const seedAdmin = async () => {
  if (!adminData.email || !adminData.password || adminData.password.length < 6) {
    throw new Error("ADMIN_EMAIL and a 6+ character ADMIN_PASSWORD are required.");
  }

  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/streamwave");

  let admin = await User.findOne({ email: adminData.email });

  if (admin) {
    admin.name = adminData.name;
    admin.password = adminData.password;
    admin.role = "admin";
    admin.blocked = false;
    admin.approvalStatus = "approved";
    admin.approvedAt = admin.approvedAt || new Date();
    admin.approvedBy = admin.approvedBy || admin._id;
    await admin.save();
  } else {
    admin = await User.create({
      name: adminData.name,
      email: adminData.email,
      password: adminData.password,
      role: "admin",
      blocked: false,
      approvalStatus: "approved",
      approvedAt: new Date()
    });

    admin.approvedBy = admin._id;
    await admin.save();
  }

  await Profile.findOneAndUpdate(
    { user: admin._id, name: "Admin" },
    {
      user: admin._id,
      name: "Admin",
      isKids: false,
      avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(adminData.name)}`
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log("Admin seed complete");
  console.log(`Email: ${adminData.email}`);
  console.log(`Password: ${adminData.password}`);
};

seedAdmin()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
