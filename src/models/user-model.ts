import mongoose, { CallbackError, Document, Schema } from "mongoose";
import { IGossip } from "./gossip-model";
import { IComment } from "./comment-model";

export interface IUser {
  firstName: string;
  lastName: string;
  avatarName: string;
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
    avatarName: {
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

UserSchema.pre("deleteOne", async function (next) {
  try {
    const userId = this.getQuery()._id;

    await mongoose
      .model<IGossip>("Gossip")
      .updateMany({ likes: { $in: [userId] } }, { $pull: { likes: userId } });
    await mongoose
      .model<IComment>("Comment")
      .updateMany({ likes: { $in: [userId] } }, { $pull: { likes: userId } });

    await mongoose.model<IGossip>("Gossip").deleteMany({ author: userId });
    await mongoose.model<IComment>("Comment").deleteMany({ author: userId });

    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

export default mongoose.model<IUserModel>("User", UserSchema);
