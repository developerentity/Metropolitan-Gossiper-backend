import bcrypt from "bcrypt";
import { usersRepo } from "../repositories/users-repo";
import { IUser, IUserModel } from "../models/user-model";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const usersService = {
  async createUser(
    firstName: string,
    lastName: string,
    avatar: string,
    email: string,
    password: string,
    about?: string
  ): Promise<IUserModel | null> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: IUser = {
      firstName,
      lastName,
      avatar,
      email,
      password: hashedPassword,
      about: about || "",
      role: "basic",
      comments: [],
      likedComments: [],
      likedGossips: [],
      gossips: [],
    };

    return usersRepo.createUser(newUser);
  },
  async updateUser(id: string, updateOps: { about: string }): Promise<boolean> {
    return usersRepo.updateUser(id, updateOps);
  },
  async checkCredentials(
    email: string,
    password: string
  ): Promise<IUserModel | null> {
    const user = await usersRepo.findByEmail(email);
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
