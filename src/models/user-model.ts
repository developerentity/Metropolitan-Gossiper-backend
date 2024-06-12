import mongoose, { CallbackError, Document, Model, Schema } from "mongoose";
import Gossip from "./gossip-model";
import Comment from "./comment-model";

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

export interface IUserModelStatic extends Model<IUserModel> {
  cleanUpGossipAssociations(gossipId: string): Promise<void>;
  cleanUpCommentAssociations(commentIds: string[]): Promise<void>;
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

UserSchema.statics.cleanUpGossipAssociations = async function (
  gossipId: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // delete gossipId from owner's "gossips" array
    await this.updateOne(
      { gossips: { $in: [gossipId] } },
      { $pull: { gossips: gossipId } }
    ).session(session);

    // clean up all likes in users' "likedGossips" array
    await this.updateMany(
      { likedGossips: { $in: [gossipId] } },
      { $pull: { likedGossips: gossipId } }
    ).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

UserSchema.statics.cleanUpCommentAssociations = async function (
  commentIds: string[]
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // clean up all likes in users' "likedComments" array
    await this.updateMany(
      { likedComments: { $in: commentIds } },
      { $pull: { likedComments: { $in: commentIds } } }
    ).session(session);

    // delete commentId from owner's "comments" array
    await this.updateMany(
      { comments: { $in: commentIds } },
      { $pull: { comments: { $in: commentIds } } }
    ).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const User = mongoose.model<IUserModel, IUserModelStatic>("User", UserSchema);
export default User;
