import { UserDBType } from "../domain/users-service";

declare global {
  declare namespace Express {
    export interface Request {
      user: UserDBType | null;
    }
  }
}
