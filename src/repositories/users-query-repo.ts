import User, { IUserModel } from "../models/user-model";
import { ItemsListViewModel } from "../types/response-types";

/**
 * This is the DAL (Data Access Layer).
 * Which is responsible for Read only operations.
 */
export const usersQueryRepo = {
  async getAllUsers(queryParams: {
    limit: number;
    page: number;
    sortField: string;
    sortOrder: string;
  }): Promise<ItemsListViewModel<IUserModel>> {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const sortField = queryParams.sortField || "createdAt";
    const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;

    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find()
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)

    return {
      totalItems: totalUsers,
      totalPages: totalPages,
      currentPage: page,
      items: users,
    };
  },
  async findUserById(id: string): Promise<IUserModel | null> {
    const user = await User.findById(id);
    return user;
  },
};
