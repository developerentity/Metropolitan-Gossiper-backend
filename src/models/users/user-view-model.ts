export type UserViewModel = {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | undefined | null; // delete null in future
  email: string;
  about: string;
  gossips: string[];
  createdAt: Date;
};
