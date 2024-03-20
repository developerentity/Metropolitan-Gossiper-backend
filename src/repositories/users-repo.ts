import { ObjectId } from "mongodb";

import User, { IUser, IUserModel } from "../models/user-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const usersRepo = {
  async getAllUsers(): Promise<IUserModel[]> {
    return await User.find().sort({ createdAt: -1 });
  },
  async createUser(user: IUser): Promise<IUserModel | null> {
    return await User.create(user);
  },
  async findUserById(id: ObjectId): Promise<IUserModel | null> {
    return await User.findById(id).populate("gossips");
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<IUserModel | null> {
    return await User.findOne({
      $or: [{ email: loginOrEmail }, { username: loginOrEmail }],
    });
  },
};
