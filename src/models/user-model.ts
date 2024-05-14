import mongoose, { Document, Schema } from "mongoose";

export interface IUser {
  firstName: string;
  lastName: string;
  avatar: string;
  email: string;
  password: string;
  about: string;
  role: string;
  gossips: string[];
  likedGossips: string[];
  comments: string[];
  likedComments: string[];
  verified: boolean;
}

export interface IUserModel extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
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
    verified: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUserModel>("User", UserSchema);
