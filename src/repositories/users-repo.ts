import { ObjectId } from "mongodb";

import { UserDBType } from "../domain/users-service";
import { usersCollection } from "./db";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const usersRepo = {
  async getAllUsers(): Promise<UserDBType[]> {
    return await usersCollection.find().sort("createdAt", -1).toArray();
  },
  async createUser(user: UserDBType): Promise<UserDBType | null> {
    const result = await usersCollection.insertOne(user);
    const created = await usersCollection.findOne({ _id: result.insertedId });
    return created;
  },
  async findUserById(id: ObjectId): Promise<UserDBType | null> {
    const user = await usersCollection.findOne({ _id: id });
    return user;
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDBType | null> {
    const user = await usersCollection.findOne({
      $or: [{ email: loginOrEmail }, { username: loginOrEmail }],
    });
    return user;
  },
};
