import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/user-model";
import { HTTP_STATUSES } from "../http-statuses";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;

  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name,
  });

  try {
    const createdUser = await user.save();
    return res.status(HTTP_STATUSES.CREATED_201).json({ user });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);
    return user
      ? res.status(HTTP_STATUSES.OK_200).json({ user })
      : res.status(HTTP_STATUSES.NOT_FOUND_404).json({ message: "not found" });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const readAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.find();
    return res.status(HTTP_STATUSES.OK_200).json({ users });
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (user) {
      user.set(req.body);
      const updatedUser = await user.save();
      return res.status(HTTP_STATUSES.CREATED_201).json({ user: updatedUser });
    } else {
      return res
        .status(HTTP_STATUSES.NOT_FOUND_404)
        .json({ message: "not found" });
    }
  } catch (error) {
    return res.status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500).json({ error });
  }
};

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.userId;

  try {
    const deletableUser = await User.findByIdAndDelete(userId);
    if (deletableUser) {
      res
        .status(HTTP_STATUSES.CREATED_201)
        .json({ deletableUser, message: "Deleted" });
    } else {
      res.status(HTTP_STATUSES.NOT_FOUND_404).json({ message: "not found" });
    }
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
