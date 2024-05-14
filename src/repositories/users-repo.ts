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
  async deleteUser(userId: string): Promise<boolean> {
    const result = await User.findByIdAndDelete(userId);
    return !!result;
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
