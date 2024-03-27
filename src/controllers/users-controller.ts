import { NextFunction, Request, Response } from "express";

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
import { jwtService } from "../application/jwt-service";
import { MAX_TOKEN_AGE } from "../config";
import { CreateUserModel } from "../models/users/create-user-model";
import { URIParamsUserModel } from "../models/users/uri-params-user-model";
import { usersQueryRepo } from "../repositories/users-query-repo";
import { usersRepo } from "../repositories/users-repo";
import { UpdateUserModel } from "../models/users/update-user-model";

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
    } else {
      const token = jwtService.createJWT(user, +MAX_TOKEN_AGE!);
      res.cookie("token", token, {
        httpOnly: true,
        maxAge: +MAX_TOKEN_AGE! * 1000,
      });

      return res.status(HTTP_STATUSES.CREATED_201).json({
        message: "User successfully Registered and Logged in",
      });
    }
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readUser = async (
  req: RequestWithParams<URIParamsUserModel>,
  res: Response
) => {
  const { username } = req.params;

  try {
    const user = await usersQueryRepo.findByUsername(username);

    return !user
      ? res
          .status(HTTP_STATUSES.NOT_FOUND_404)
          .json({ message: "User not found" })
      : res.status(HTTP_STATUSES.OK_200).json({ user });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
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
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const updateUser = async (
  req: RequestWithBody<UpdateUserModel>,
  res: Response
) => {
  const { about } = req.body;
  const updateOps = {
    about,
  };

  try {
    const username = req.user?.username;
    const user = await usersRepo.findByLoginOrEmail(username);

    if (!user) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "User not found" });
    }

    await usersService.updateUser(user._id, updateOps);

    return res
      .status(HTTP_STATUSES.OK_200)
      .json({ message: "User info updated" });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params;

  try {
    const user = await usersRepo.findByLoginOrEmail(username);

    if (!user) {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "User not found" });
    }

    await usersRepo.deleteUser(user._id);
    res.status(HTTP_STATUSES.OK_200).json({ message: "Deleted" });
  } catch (error) {
    res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

export default {
  createUser,
  readUser,
  readAll,
  updateUser,
  deleteUser,
};
