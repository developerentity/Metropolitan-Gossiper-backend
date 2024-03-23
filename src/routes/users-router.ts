import { Request, Router, Response } from "express";

import { HTTP_STATUSES } from "../http-statuses";
import { RequestWithParams, RequestWithQuery } from "../types/request-types";
import { QueryUsersModel } from "../models/users/query-users-model";
import {
  UsersListViewModel,
} from "../models/users/user-view-model";
import { usersQueryRepo } from "../repositories/users-query-repo";
import { URIParamsUserIDModel } from "../models/users/uri-params-user-id-model";
import { IUserModel } from "../models/user-model";

export const usersRouter = Router({});

usersRouter.get(
  "/get-users",
  async (
    req: RequestWithQuery<QueryUsersModel>,
    res: Response
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
    res: Response<IUserModel>
  ) => {
    const foundUser: IUserModel | null = await usersQueryRepo.findUserById(
      req.params.id
    );
    if (foundUser) {
      res.send(foundUser);
    } else {
      res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
  }
);