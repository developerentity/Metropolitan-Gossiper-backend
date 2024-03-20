import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { usersRepo } from "../repositories/users-repo";
import { IUser, IUserModel } from "../models/user-model";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const usersService = {
  async createUser(
    login: string,
    email: string,
    password: string
  ): Promise<IUserModel | null> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: IUser = {
      username: login,
      email,
      password: hashedPassword,
      role: "basic",
      comments: [],
      likedComments: [],
      likedGossips: [],
      gossips: [],
    };

    return usersRepo.createUser(newUser);
  },
  async findUserById(id: ObjectId): Promise<IUserModel | null> {
    return usersRepo.findUserById(id);
  },
  async checkCredentials(
    loginOrEmail: string,
    password: string
  ): Promise<IUserModel | null> {
    const user = await usersRepo.findByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const storedHashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(
      password,
      storedHashedPassword
    );

    if (isPasswordValid) {
      return user;
    } else {
      return null;
    }
  },
};
