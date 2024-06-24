import bcrypt from "bcrypt";
import { usersRepo } from "../repositories/users-repo";
import { IUser, IUserModel } from "../models/user-model";
import { add } from "date-fns";
import Logging from "../library/Logging";
import { emailManager } from "../utils/emailManager";
import { tokensRepo } from "../repositories/tokens-repo";
import { IToken } from "../models/token-model";
import { randomUUID } from "crypto";
import { UserViewModel } from "../models/users/user-view-model";
import { s3Manager } from "../utils/s3-manager";
import { usersQueryRepo } from "../repositories/users-query-repo";
import { ItemsListViewModel } from "../types/response-types";
import { commentsRepo } from "../repositories/comments-repo";
import { commentsQueryRepo } from "../repositories/comments-query-repo";
import { gossipsRepo } from "../repositories/gossips-repo";
import { gossipsQueryRepo } from "../repositories/gossips-query-repo";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const usersService = {
  async createUser(
    firstName: string,
    lastName: string,
    avatarName: string,
    email: string,
    password: string,
    about?: string
  ): Promise<IUserModel | null> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: IUser = {
      firstName,
      lastName,
      avatarName,
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
  async updateUser(
    user: IUserModel,
    updateOps: {
      firstName: string;
      lastName: string;
      about: string;
      file?: { size: number; buffer: Buffer; mimetype: string };
    }
  ): Promise<UserViewModel | null> {
    const oldAvatarName = user.avatarName;
    let avatarName: string | undefined | null = undefined;

    if (updateOps.file && updateOps.file.size !== 0) {
      avatarName = await s3Manager.create(updateOps.file);

      if (oldAvatarName) await s3Manager.delete(oldAvatarName);
    }

    const processedOps: Partial<IUser> = {
      firstName: updateOps.firstName,
      lastName: updateOps.lastName,
      about: updateOps.about,
      avatarName,
    };

    const updatedUser = await usersRepo.updateUser(user.id, processedOps);
    return updatedUser ? this._transformToViewModel(updatedUser) : null;
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
  async resendVerification(user: IUserModel): Promise<boolean> {
    const tokenData = await tokensRepo.findByUserId(user._id);
    if (!tokenData) return false;

    await emailManager.sendEmailConfirmationMessage(
      user.email,
      user._id,
      tokenData.token
    );
    await tokensRepo.addSentDate(tokenData._id, new Date());
    return true;
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
  async readUserById(userId: string): Promise<UserViewModel | null> {
    const user = await usersQueryRepo.findUserById(userId);
    return user ? await this._transformToViewModel(user) : null;
  },
  async readUsers(queryParams: {
    limit: number;
    page: number;
    sortField: string;
    sortOrder: string;
    searchQuery: string;
  }): Promise<ItemsListViewModel<UserViewModel>> {
    const usersData = await usersQueryRepo.getAllUsers(queryParams);
    return {
      totalItems: usersData.totalItems,
      totalPages: usersData.totalPages,
      currentPage: usersData.currentPage,
      items: await Promise.all(
        usersData.items.map((gossip) => this._transformToViewModel(gossip))
      ),
    };
  },
  async deleteUserAndRelatedData(userId: string): Promise<boolean> {
    // find all comments by the user
    const comments = await commentsQueryRepo.findAllCommentsByTheUser(userId);
    const commentsIds = comments.map((comment) => comment._id);

    // find all gossips by the user
    const gossips = await gossipsQueryRepo.findAllGossipsByTheUser(userId);
    const gossipIds = gossips.map((gossip) => gossip._id);

    // remove all comments and gossips by the user
    await commentsRepo.removeAllCommentsByTheUser(userId);
    await gossipsRepo.removeAllGossipsByTheUser(userId);

    // remove all comments on user's gossips
    await commentsRepo.removeAllCommentsOnUsersGossips(gossipIds);

    // remove all gossips by the user
    await gossipsRepo.removeAllGossipsByTheUser(userId);

    // remove user's likes from other comments and gossips
    await commentsRepo.removeUsersLikes(userId);
    await gossipsRepo.removeUsersLikes(userId);

    // remove references to likedComments
    // and likedGossips of all users
    await usersRepo.removeLikedCommentsReference(commentsIds);
    await usersRepo.removeLikedGossipsReference(gossipIds);

    // remove user's token
    await tokensRepo.deleteByUserId(userId);

    // remove the user
    await usersRepo.deleteUser(userId);

    return true;
  },
  async _transformToViewModel(user: IUserModel): Promise<UserViewModel> {
    const avatarUrl = user.avatarName
      ? await s3Manager.read(user.avatarName)
      : undefined;

    return {
      id: user._id.toHexString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl,
      email: user.email,
      about: user.about,
      gossips: user.gossips,
      createdAt: user.createdAt,
      likedGossips: user.likedGossips,
      likedComments: user.likedComments,
    };
  },
};
