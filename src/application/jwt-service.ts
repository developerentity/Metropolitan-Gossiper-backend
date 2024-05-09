import jwt, { JwtPayload } from "jsonwebtoken";

import {
  SECRET_ACCESS_TOKEN,
  REFRESH_ACCESS_TOKEN,
  EXPIRES_TOKEN,
  EXPIRES_REFRESH_TOKEN,
} from "../config";

export const jwtService = {
  async generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId: userId }, SECRET_ACCESS_TOKEN!, {
      expiresIn: +EXPIRES_TOKEN! / 1000,
    });
    const refreshToken = jwt.sign({ userId: userId }, REFRESH_ACCESS_TOKEN!, {
      expiresIn: +EXPIRES_REFRESH_TOKEN! / 1000,
    });
    return { accessToken, refreshToken };
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
