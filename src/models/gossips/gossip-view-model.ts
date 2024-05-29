export type GossipViewModel = {
  id: string;
  title: string;
  content: string;
  comments: string[];
  imageUrl: string | undefined;
  author: string;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
};
