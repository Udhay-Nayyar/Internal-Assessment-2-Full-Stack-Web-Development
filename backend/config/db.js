const mongoose = require("mongoose");

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI must be set to a reachable MongoDB connection string");
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");
};
