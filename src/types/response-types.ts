import { UserViewModel } from "../models/users/user-view-model";

export interface ErrorResponse {
  message?: any;
}

export type ItemsListViewModel<T> = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  items: T[];
};

export type AuthResponseType = {
  user: UserViewModel;
  backendTokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
};
