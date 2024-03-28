import { IGossip } from "../gossip-model";
import { IUserModel } from "../user-model";

export type UserViewModel = {
  /**
   * User name
   */
  username: string;
  gossips: IGossip[];
  about: string;
};

export type UsersListViewModel = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  items: IUserModel[];
};
