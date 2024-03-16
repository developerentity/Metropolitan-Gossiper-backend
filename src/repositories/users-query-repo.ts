import { UsersListViewModel } from "../models/users/user-view-model";
import { UserViewModel } from "../models/users/user-view-model";
import { getUserViewModel } from "../models/users/get-user-view-model";
import User from "../models/user-model";

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
  }): Promise<UsersListViewModel> {
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
      .exec();

    const items = users.map((user) => getUserViewModel(user.toObject()));

    return {
      totalItems: totalUsers,
      totalPages: totalPages,
      currentPage: page,
      items: items,
    };
  },
  async findUserById(id: string): Promise<UserViewModel | null> {
    const user = await User.findById(id).exec();
    return user ? getUserViewModel(user.toObject()) : null;
  },
  async findByUsername(username: string): Promise<UserViewModel | null> {
    const user = await User.findOne({ username: username }).exec();
    return user ? getUserViewModel(user.toObject()) : null;
  },
};
