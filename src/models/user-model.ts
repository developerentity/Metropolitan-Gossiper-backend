import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password: string;
  role: string;
  gossips: string[];
  likedGossips: string[];
  comments: string[];
  likedComments: string[];
}

export interface IUserModel extends IUser, Document {}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Basic",
      required: true,
    },
    gossips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gossip" }],
    likedGossips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gossip" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export default mongoose.model<IUserModel>("User", UserSchema);
