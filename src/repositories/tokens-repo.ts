import { ObjectId } from "mongoose";
import Token, { IToken, ITokenModel } from "../models/token-model";

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
  async addSentDate(tokenId: ObjectId, date: Date): Promise<boolean> {
    const result = await Token.updateOne(
      { _id: tokenId },
      { $push: { sentEmails: date } }
    );
    return result.modifiedCount === 1;
  },
  async delete(tokenId: ObjectId): Promise<boolean> {
    const result = await Token.findByIdAndDelete(tokenId);
    return !!result;
  },
};
