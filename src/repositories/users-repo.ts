import { ObjectId } from "mongodb";

import { UserDBType } from "../domain/users-service";
import User from "../models/user-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const usersRepo = {
  async getAllUsers(): Promise<UserDBType[]> {
    return await User.find().sort({ createdAt: -1 });
  },
  async createUser(user: UserDBType): Promise<UserDBType | null> {
    return await User.create(user);
  },
  async findUserById(id: ObjectId): Promise<UserDBType | null> {
    return await User.findById(id);
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserDBType | null> {
    return await User.findOne({
      $or: [{ email: loginOrEmail }, { username: loginOrEmail }],
    });
  },
};
