import { ObjectId } from "mongodb";
import { IUserModel } from "../models/user-model";

export type GossipDBType = {
  _id: ObjectId;
  authorData: IUserModel;
  title: string;
  content: {
    imgUrl: string;
    text: string;
  };
  createdAt: Date;
};
