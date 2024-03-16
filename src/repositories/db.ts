import mongoose from "mongoose";

import { URI } from "../config";

const mongoDB = URI || "mongodb://0.0.0.0:27017";

export async function runDB() {
  try {
    await mongoose.connect(mongoDB, { dbName: "metropolitan-gossiper" });
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
