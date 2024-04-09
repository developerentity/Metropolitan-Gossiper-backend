import { Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from "../types/request-types";
import { QueryUsersModel } from "../models/users/query-users-model";
import { UsersListViewModel } from "../models/users/user-view-model";
import { ErrorResponse } from "../types/response-types";
import { usersService } from "../domain/users-service";
import { cookieOptions, jwtService } from "../application/jwt-service";
import { CreateUserModel } from "../models/users/create-user-model";
import { URIParamsUserModel } from "../models/users/uri-params-user-model";
import { usersQueryRepo } from "../repositories/users-query-repo";
import { usersRepo } from "../repositories/users-repo";
import { UpdateUserModel } from "../models/users/update-user-model";
import Logging from "../library/Logging";

const createUser = async (
  req: RequestWithBody<CreateUserModel>,
  res: Response
) => {
  const { username, email, password, about } = req.body;
  try {
    const user = await usersService.createUser(
      username,
      email,
      password,
      about
    );

    if (!user) {
      return res.status(HTTP_STATUSES.UNPROCESSABLE_CONTENT_422).json({
        message: "Register failed",
      });
    }

    const registeredUser = await usersQueryRepo.findUserById(user._id);

    const { accessToken, refreshToken } = await jwtService.generateTokens(
      user.id
    );

    return res
      .cookie("refresh-token", refreshToken, cookieOptions)
      .status(HTTP_STATUSES.OK_200)
      .json({
        message: "User successfully Registered and Logged in",
        accessToken: accessToken,
      });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while registering the user." });
  }
};

const readUser = async (
  req: RequestWithParams<URIParamsUserModel>,
  res: Response
) => {
  const { userId } = req.params;

  try {
    const user = await usersQueryRepo.findUserById(userId);
    if (!user) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "User not found" });
    }

    return res.status(HTTP_STATUSES.OK_200).json({ user });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while reading the user." });
  }
};

const readAll = async (
  req: RequestWithQuery<QueryUsersModel>,
  res: Response<UsersListViewModel | ErrorResponse>
) => {
  try {
    const foundUsers: UsersListViewModel = await usersQueryRepo.getAllUsers({
      limit: +req.query.pageSize,
      page: +req.query.pageNumber,
      sortField: req.query.sortField,
      sortOrder: req.query.sortOrder,
    });

    res.status(HTTP_STATUSES.OK_200).json(foundUsers);
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while reading users." });
  }
};

const updateUser = async (
  req: RequestWithParamsAndBody<URIParamsUserModel, UpdateUserModel>,
  res: Response
) => {
  const { userId } = req.params;
  const { about } = req.body;
  const updateOps = {
    // all the other updatable options...
    about,
  };

  if (!userId) {
    return res
      .status(HTTP_STATUSES.NOT_FOUND_404)
      .json({ message: "User not found" });
  }

  try {
    await usersService.updateUser(userId, updateOps);
    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "User info updated" });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while updating the user." });
  }
};

const deleteUser = async (
  req: RequestWithParams<URIParamsUserModel>,
  res: Response
) => {
  const { userId } = req.params;
  if (!userId) {
    return res
      .status(HTTP_STATUSES.NOT_FOUND_404)
      .json({ message: "User not found" });
  }

  try {
    await usersRepo.deleteUser(userId);
    res.status(HTTP_STATUSES.OK_200).json({ message: "Deleted" });
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while deleting the user." });
  }
};

export default {
  createUser,
  readUser,
  readAll,
  updateUser,
  deleteUser,
};
