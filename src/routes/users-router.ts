import { Request, Router, Response } from "express";

import { jwtService } from "../application/jwt-service";
import { HTTP_STATUSES } from "../http-statuses";
import { RequestWithParams, RequestWithQuery } from "../types/request-types";
import { usersService } from "../domain/users-service";
import { QueryUsersModel } from "../models/users/query-users-model";
import {
  UserViewModel,
  UsersListViewModel,
} from "../models/users/user-view-model";
import { usersQueryRepo } from "../repositories/users-query-repo";
import { URIParamsUserIDModel } from "../models/users/uri-params-user-id-model";

export const usersRouter = Router({});

usersRouter.get(
  "/get-users",
  async (
    req: RequestWithQuery<QueryUsersModel>,
    res: Response<UsersListViewModel>
  ) => {
    const foundUsers: UsersListViewModel = await usersQueryRepo.getAllUsers({
      limit: +req.query.pageSize,
      page: +req.query.pageNumber,
      sortField: req.query.sortField,
      sortOrder: req.query.sortOrder,
    });
    res.send(foundUsers);
  }
);
usersRouter.get(
  "/:id",
  async (
    req: RequestWithParams<URIParamsUserIDModel>,
    res: Response<UserViewModel>
  ) => {
    const foundUser: UserViewModel | null = await usersQueryRepo.findUserById(
      req.params.id
    );
    if (foundUser) {
      res.send(foundUser);
    } else {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  }
);
usersRouter.post("/signup", async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  const user = await usersService.createUser(username, email, password);
  if (user) {
    const maxAge = 3 * 60 * 60;
    const token = jwtService.createJWT(user, maxAge);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: maxAge * 1000,
    });
    res.status(HTTP_STATUSES.CREATED_201).json({
      message: "User successfully Registered and Logged in",
      user: user._id,
    });
  } else {
    res.status(HTTP_STATUSES.UNPROCESSABLE_CONTENT_422).json({
      message: "Register failed",
    });
  }
});
