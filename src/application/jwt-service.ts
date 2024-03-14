import jwt, { JwtPayload } from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from "../config";
import { UserDBType } from "../domain/users-service";
import { ObjectId } from "mongodb";

export const jwtService = {
  async createJWT(user: UserDBType) {
    const token = jwt.sign({ userId: user._id }, SECRET_ACCESS_TOKEN!, {
      expiresIn: "1h",
    });
    return token;
  },
  async getUserIdByToken(token: string) {
    try {
      const result = jwt.verify(token, SECRET_ACCESS_TOKEN!) as JwtPayload;
      return new ObjectId(result.userId);
    } catch (error) {
      return null;
    }
  },
};
