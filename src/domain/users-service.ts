import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { usersRepo } from "../repositories/users-repo";

/**
 *  This is a BLL (Business Logic Layer).
 *  Which most commonly responsible for CUD operations (CRUD without Read).
 */
export const usersService = {
  async createUser(
    login: string,
    email: string,
    password: string
  ): Promise<UserDBType | null> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser: UserDBType = {
      _id: new ObjectId(),
      username: login,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      role: "basic",
    };

    return usersRepo.createUser(newUser);
  },
  async findUserById(id: ObjectId): Promise<UserDBType | null> {
    return usersRepo.findUserById(id);
  },
  async checkCredentials(
    loginOrEmail: string,
    password: string
  ): Promise<UserDBType | null> {
    const user = await usersRepo.findByLoginOrEmail(loginOrEmail);
    if (!user) return null;

    const storedHashedPassword = user.password;
    const isPasswordValid = await bcrypt.compare(
      password,
      storedHashedPassword
    );

    if (isPasswordValid) {
      return user;
    } else {
      return null;
    }
  },
};
export type UserDBType = {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  role: "admin" | "basic";
};
