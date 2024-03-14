import { ObjectId } from "mongodb";
import { UserDBType } from "./users-service";

export type GossipDBType = {
  _id: ObjectId;
  authorData: UserDBType;
  title: string;
  content: {
    imgUrl: string;
    text: string;
  };
  createdAt: Date;
};
