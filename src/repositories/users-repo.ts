import { ObjectId } from "mongodb";

import User, { IUser, IUserModel } from "../models/user-model";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for CUD (CRUD without Read) operations.
 */
export const usersRepo = {
  async getUserIdByUsername(username: string): Promise<ObjectId | null> {
    const user = await User.findOne({ username: username });
    return user ? user._id : null;
  },
  async getAllUsers(): Promise<IUserModel[]> {
    return await User.find().sort({ createdAt: -1 });
  },
  async createUser(user: IUser): Promise<IUserModel | null> {
    return await User.create(user);
  },
  async updateUser(
    id: ObjectId,
    updateOps: { about: string }
  ): Promise<boolean> {
    const result = await User.updateOne({ _id: id }, { $set: updateOps });
    return result.modifiedCount === 1;
  },
  async findUserById(id: ObjectId): Promise<IUserModel | null> {
    return await User.findById(id).populate("gossips");
  },
  async findByLoginOrEmail(loginOrEmail: string): Promise<IUserModel | null> {
    return await User.findOne({
      $or: [{ email: loginOrEmail }, { username: loginOrEmail }],
    });
  },
  async deleteUser(userId: ObjectId): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
  },
};
