import { IUserModel } from "../models/user-model";

declare global {
  declare namespace Express {
    export interface Request {
      user: IUserModel;
    }
  }
}
