import { Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from "../types/request-types";
import { QueryUsersModel } from "../models/users/query-users-model";
import { ErrorResponse, ItemsListViewModel } from "../types/response-types";
import { usersService } from "../domain/users-service";
import { CreateUserModel } from "../models/users/create-user-model";
import { URIParamsUserModel } from "../models/users/uri-params-user-model";
import { UpdateUserModel } from "../models/users/update-user-model";
import Logging from "../library/Logging";
import { EXPIRES_TOKEN } from "../config";
import { jwtService } from "../application/jwt-service";
import { UserViewModel } from "../models/users/user-view-model";

const createUser = async (
  req: RequestWithBody<CreateUserModel>,
  res: Response
) => {
  const { firstName, lastName, avatar, email, password, about } = req.body;

  try {
    const user = await usersService.createUser(
      firstName,
      lastName,
      avatar,
      email,
      password,
      about
    );

    if (!user) {
      return res.status(HTTP_STATUSES.UNPROCESSABLE_CONTENT_422).json({
        message: "Register failed",
      });
    }

    const registeredUser = await usersService.readUserById(user._id);

    const { accessToken, refreshToken } = await jwtService.generateTokens(
      user.id
    );

    return res.status(HTTP_STATUSES.OK_200).json({
      registeredUser,
      backendTokens: {
        accessToken,
        refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + +EXPIRES_TOKEN!),
      },
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
  res: Response<UserViewModel | ErrorResponse>
) => {
  const { userId } = req.params;

  try {
    const user = await usersService.readUserById(userId);
    if (!user) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "User not found" });
    }

    return res.status(HTTP_STATUSES.OK_200).json(user);
  } catch (error) {
    Logging.error(error);
    return res
      .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
      .json({ message: "An error occurred while reading the user." });
  }
};

const readAll = async (
  req: RequestWithQuery<QueryUsersModel>,
  res: Response<ItemsListViewModel<UserViewModel> | ErrorResponse>
) => {
  try {
    const foundUsers: ItemsListViewModel<UserViewModel> =
      await usersService.readUsers({
        limit: +req.query.pageSize,
        page: +req.query.pageNumber,
        sortField: req.query.sortField,
        sortOrder: req.query.sortOrder,
        searchQuery: req.query.searchQuery,
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
    const result = await usersService.deleteUserAndRelatedData(userId);
    if (!result)
      return res
        .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
        .json({ message: "An item or some of related data wasn't deleted" });

    return res.status(HTTP_STATUSES.OK_200).json({ message: "Deleted" });
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
