import bcrypt from "bcrypt";
import { usersRepo } from "../repositories/users-repo";
import { IUser, IUserModel } from "../models/user-model";
import { add } from "date-fns";
import Logging from "../library/Logging";
import { emailManager } from "../utils/emailManager";
import { tokensRepo } from "../repositories/tokens-repo";
import { IToken } from "../models/token-model";
import { randomUUID } from "crypto";

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
      verified: false,
    };

    const createdUser = await usersRepo.createUser(newUser);
    if (!createdUser) return null;

    const newToken: IToken = {
      userId: createdUser._id,
      token: randomUUID(),
      expirationDate: add(new Date(), { hours: 0, minutes: 15 }),
    };

    const createdToken = await tokensRepo.create(newToken);

    try {
      await emailManager.sendEmailConfirmationMessage(
        createdUser.email,
        createdUser._id,
        createdToken.token
      );
      await tokensRepo.addSentDate(createdToken._id, new Date());
    } catch (error) {
      Logging.error(error);
      await usersRepo.deleteUser(createdUser._id);
      await tokensRepo.delete(createdToken._id);
      return null;
    }

    return createdUser;
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
  async confirmEmail(userId: string, token: string): Promise<boolean> {
    const user = await usersRepo.findUserById(userId);
    if (!user) return false;

    const tokenData = await tokensRepo.findByIdAndToken(userId, token);
    if (!tokenData) return false;

    if (tokenData.expirationDate < new Date()) return false;

    await usersRepo.updateVerification(userId);
    await tokensRepo.delete(tokenData._id);
    return true;
  },
};
