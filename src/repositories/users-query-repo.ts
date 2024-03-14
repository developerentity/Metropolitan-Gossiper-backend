import { ObjectId } from "mongodb";

import { UsersListViewModel } from "../models/users/user-view-model";
import { UserViewModel } from "../models/users/user-view-model";
import { usersCollection } from "./db";
import { getUserViewModel } from "../models/users/get-user-view-model";
// import { getUserViewModel } from "../utils/getUserViewModel";

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

    const totalUsers = await usersCollection.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const users = await usersCollection
      .find()
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      totalItems: totalUsers,
      totalPages: totalPages,
      currentPage: page,
      items: users.map(getUserViewModel),
    };
  },
  async findUserById(id: ObjectId): Promise<UserViewModel | null> {
    const result = await usersCollection.findOne({ _id: id });
    return result ? getUserViewModel(result) : null;
  },
  async findByUsername(username: string): Promise<UserViewModel | null> {
    const result = await usersCollection.findOne({ username: username });
    return result ? getUserViewModel(result) : null;
  },
};
