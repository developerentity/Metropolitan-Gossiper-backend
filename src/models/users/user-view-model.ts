export type UserViewModel = {
  /**
   * User ID
   */
  id: string;
  /**
   * User name
   */
  username: string;
  /**
   * User email
   */
  email: string;
};

export type UsersListViewModel = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  items: UserViewModel[];
};
