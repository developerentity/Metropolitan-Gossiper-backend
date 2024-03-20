import jwt, { JwtPayload } from "jsonwebtoken";

import { IUserModel } from "../models/user-model";
import { SECRET_ACCESS_TOKEN } from "../config";

export const jwtService = {
  async createJWT(user: IUserModel, maxAge: number) {
    const token = jwt.sign({ userId: user._id }, SECRET_ACCESS_TOKEN!, {
      expiresIn: maxAge,
    });
    return token;
  },
  async getUserIdByToken(token: string) {
    try {
      const result = jwt.verify(token, SECRET_ACCESS_TOKEN!) as JwtPayload;
      return result.userId;
    } catch (error) {
      return null;
    }
  },
};
