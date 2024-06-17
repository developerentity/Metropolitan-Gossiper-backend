import { UpdateWriteOpResult } from "mongoose";
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
  async updateUser(id: string, updateOps: { about: string }): Promise<boolean> {
    const result = await User.updateOne({ _id: id }, { $set: updateOps });
    return result.modifiedCount === 1;
  },
  async findUserById(id: string): Promise<IUserModel | null> {
    return await User.findById(id).populate("gossips");
  },
  async findByEmail(email: string): Promise<IUserModel | null> {
    return await User.findOne({ email: email });
  },
  async deleteUser(userId: string): Promise<IUserModel | null> {
    return await User.findByIdAndDelete(userId);
  },
  async removeGossipsReference(
    gossipsIds: string[]
  ): Promise<UpdateWriteOpResult> {
    return await User.updateMany(
      {},
      { $pull: { gossips: { $in: gossipsIds } } }
    );
  },
  async removeCommentReference(
    commentsIds: string[]
  ): Promise<UpdateWriteOpResult> {
    return await User.updateMany(
      {},
      { $pull: { comments: { $in: commentsIds } } }
    );
  },
  async removeLikedGossipsReference(
    gossipIds: string[]
  ): Promise<UpdateWriteOpResult> {
    return await User.updateMany(
      {},
      { $pull: { likedGossips: { $in: gossipIds } } }
    );
  },
  async removeLikedCommentsReference(
    commentIds: string[]
  ): Promise<UpdateWriteOpResult> {
    return await User.updateMany(
      {},
      { $pull: { likedComments: { $in: commentIds } } }
    );
  },
  async checkIfEmailIsAlreadyOccupied(email: string): Promise<boolean> {
    const existingUser = await User.findOne({ email });
    return !!existingUser;
  },
  async updateVerification(userId: string): Promise<boolean> {
    const result = await User.updateOne({ _id: userId }, { verified: true });
    return result.modifiedCount === 1;
  },
};
