import { DeleteResult } from "mongodb";
import User from "../models/user-model";
import Token from "../models/token-model";
import Gossip from "../models/gossip-model";
import Comment from "../models/comment-model";
import { MONGO_URI } from "../config";

export const testsRepo = {
  async clearUsers(): Promise<DeleteResult> {
    return await User.deleteMany({});
  },
  async clearTokens(): Promise<DeleteResult> {
    return await Token.deleteMany({});
  },
  async clearGossips(): Promise<DeleteResult> {
    return await Gossip.deleteMany({});
  },
  async clearComments(): Promise<DeleteResult> {
    return await Comment.deleteMany({});
  },
};
