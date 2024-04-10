import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  about: string;
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
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
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
    about: String,
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
