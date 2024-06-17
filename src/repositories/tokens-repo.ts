import { ObjectId } from "mongoose";
import Token, { IToken, ITokenModel } from "../models/token-model";
import { DeleteResult } from "mongodb";

export const tokensRepo = {
  async create(token: IToken): Promise<ITokenModel> {
    return await Token.create(token);
  },
  async findByIdAndToken(
    userId: string,
    token: string
  ): Promise<ITokenModel | null> {
    return await Token.findOne({ userId, token });
  },
  async findByUserId(userId: string): Promise<ITokenModel | null> {
    return await Token.findOne({ userId });
  },
  async addSentDate(tokenId: ObjectId, date: Date): Promise<boolean> {
    const result = await Token.updateOne(
      { _id: tokenId },
      { $push: { sentEmails: date } }
    );
    return result.modifiedCount === 1;
  },
  async deleteByUserId(userId: string): Promise<DeleteResult> {
    return await Token.deleteOne({ userId });
  },
  async delete(tokenId: ObjectId): Promise<boolean> {
    const result = await Token.findByIdAndDelete(tokenId);
    return !!result;
  },
};
