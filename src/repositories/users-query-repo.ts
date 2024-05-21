import User, { IUserModel } from "../models/user-model";
import { UserViewModel } from "../models/users/user-view-model";
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
    searchQuery: string;
  }): Promise<ItemsListViewModel<UserViewModel>> {
    const limit = queryParams.limit || 10;
    const page = queryParams.page || 1;
    const sortField = queryParams.sortField || "createdAt";
    const sortOrder = queryParams.sortOrder === "desc" ? -1 : 1;
    const searchQuery = queryParams.searchQuery || "";

    const totalUsers = await User.countDocuments({
      $or: [
        { firstName: { $regex: searchQuery, $options: "i" } },
        { lastName: { $regex: searchQuery, $options: "i" } },
      ],
    });
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await User.find({
      $or: [
        { firstName: { $regex: searchQuery, $options: "i" } },
        { lastName: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const transformedUsers = users.map((u) => transformToViewModel(u));

    return {
      totalItems: totalUsers,
      totalPages: totalPages,
      currentPage: page,
      items: transformedUsers,
    };
  },
  async findUserById(id: string): Promise<UserViewModel | null> {
    const user = await User.findById(id);
    return user ? transformToViewModel(user) : null;
  },
};

const transformToViewModel = (user: IUserModel): UserViewModel => {
  return {
    id: user._id.toHexString(),
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
    email: user.email,
    about: user.about,
    gossips: user.gossips,
    createdAt: user.createdAt,
  };
};
