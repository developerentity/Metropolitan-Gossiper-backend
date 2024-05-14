import mongoose from "mongoose";

import { MONGO_URI } from "../config";
import Logging from "../library/Logging";

const mongoDB = MONGO_URI || "mongodb://0.0.0.0:27017";

export async function runDB() {
  try {
    await mongoose.connect(mongoDB, { dbName: "metropolitan-gossiper" });
    Logging.info("Connected to MongoDB successfully!");
  } catch (error) {
    Logging.error("Error connecting to MongoDB: ");
    Logging.error(error);
  }
}
