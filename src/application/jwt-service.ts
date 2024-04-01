import jwt, { JwtPayload } from "jsonwebtoken";

import { SECRET_ACCESS_TOKEN, REFRESH_ACCESS_TOKEN } from "../config";

export const jwtService = {
  async generateAccessJWT(userId: string) {
    return jwt.sign({ userId }, SECRET_ACCESS_TOKEN!, {
      expiresIn: "15m",
    });
  },
  async generateRefreshJWT(userId: string) {
    return jwt.sign({ userId }, REFRESH_ACCESS_TOKEN!, {
      expiresIn: "1d",
    });
  },
  async verifyAccessJWT(token: string) {
    const result = jwt.verify(token, SECRET_ACCESS_TOKEN!) as JwtPayload;
    return result.userId;
  },
  async verifyRefreshJWT(token: string) {
    const result = jwt.verify(token, REFRESH_ACCESS_TOKEN!) as JwtPayload;
    return result.userId;
  },
};
