export type UserViewModel = {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined;
  email: string;
  about: string;
  gossips: string[];
  likedGossips: string[];
  likedComments: string[];
  createdAt: Date;
};
