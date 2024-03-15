import { MongoClient, ServerApiVersion } from "mongodb";

import { URI } from "../config";
import { GossipDBType } from "../domain/gossips-service";
import { UserDBType } from "../domain/users-service";

const mongoDB = URI || "mongodb://0.0.0.0:27017";

const client = new MongoClient(mongoDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function runDB() {
  try {
    // Connect the client to the server
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinger your deployment. You successfully connected to MongoDB!"
    );
  } catch (err) {
    console.log("Can't connect to DB: " + err);
    await client.close();
  }
}

const db = client.db("metropolitan-gossiper");
export const productsCollection = db.collection<GossipDBType>("gossips");
export const usersCollection = db.collection<UserDBType>("users");
