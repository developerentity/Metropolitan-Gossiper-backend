export type CommentViewModel = {
  id: string;
  content: string;
  author: string;
  gossip: string;
  parent: string | null;
  likes: string[];
  createdAt: Date;
};
