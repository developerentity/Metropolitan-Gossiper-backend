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
    // Step 1: Find all comments by the user
    const comments = await commentsQueryRepo.findAllCommentsByTheUser(userId);

    // Step 2: Remove all comments by the user
    await commentsRepo.removeAllCommentsByTheUser(userId);

    // Step 3: Remove user's likes from other gossips and comments
    await gossipsRepo.removeUsersLikes(userId);
    await commentsRepo.removeUsersLikes(userId);

    // Step 4: Find all gossips by the user
    const gossips = await gossipsQueryRepo.findAllGossipsByTheUser(userId);

    // Step 5: Remove all comments on user's gossips
    const gossipIds = gossips.map((gossip) => gossip._id);
    await commentsRepo.removeAllCommentsOnUsersGossips(gossipIds);

    // Step 6: Remove all gossips by the user
    await gossipsRepo.removeAllGossipsByTheUser(userId);

    // Step 7: Remove references to user's comments from likedComments of other users
    const commentIds = comments.map((comment) => comment._id);
    await usersRepo.removeLikedCommentsFromUsersLikesArray(commentIds);

    // Step 8: Remove references to user's gossips from likedGossips of other users
    await usersRepo.removeLikedGossipsFromUsersLikesArray(gossipIds);

    // Step 9: Remove the user
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
    };
  },
};
