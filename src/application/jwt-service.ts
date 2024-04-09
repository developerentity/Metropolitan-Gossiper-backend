import jwt, { JwtPayload } from "jsonwebtoken";

import {
  SECRET_ACCESS_TOKEN,
  REFRESH_ACCESS_TOKEN,
  MAX_TOKEN_AGE,
} from "../config";
import { CookieOptions } from "express";

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "strict",
  maxAge: +MAX_TOKEN_AGE! * 1000,
};

export const jwtService = {
  async generateTokens(userId: string) {
    const accessToken = jwt.sign({ userId: userId }, SECRET_ACCESS_TOKEN!, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: userId }, REFRESH_ACCESS_TOKEN!, {
      expiresIn: "7d",
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
