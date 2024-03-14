import { UserDBType } from "../../domain/users-service";
import { UserViewModel } from "./user-view-model";

export const getUserViewModel = (dbUser: UserDBType): UserViewModel => {
  return {
    id: dbUser._id.toString(),
    username: dbUser.username,
    email: dbUser.email,
  };
};
