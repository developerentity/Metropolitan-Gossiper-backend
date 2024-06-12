import mongoose, { Document, Schema, Model } from "mongoose";
import User, { IUser } from "./user-model";
import Comment, { IComment, ICommentModel } from "./comment-model";
import { CallbackError } from "mongoose";

export interface IGossip {
  title: string;
  content: string;
  imageName: string | null | undefined;
  author: string;
  comments: string[];
  likes: string[];
}

export interface IGossipModel extends IGossip, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IGossipModelStatic extends Model<IGossipModel> {
  createAndAssociateWithUser(gossip: IGossip): Promise<IGossipModel>;
  // deleteAndDissociateFromUser(gossipId: string): Promise<IGossipModel | null>;
  likeGossip(authorId: string, gossipId: string): Promise<string[] | null>;
  unlikeGossip(authorId: string, gossipId: string): Promise<string[] | null>;
  cleanUpUserAssociations(userId: string): Promise<void>;
  cleanUpCommentAssociations(commentId: string): Promise<void>;
}

const GossipSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageName: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

GossipSchema.statics.createAndAssociateWithUser = async function (
  gossipData: IGossip
) {
  const gossip = await this.create(gossipData);
  await mongoose
    .model("User")
    .findByIdAndUpdate(
      gossip.author,
      { $push: { gossips: gossip._id } },
      { new: true }
    );
  return gossip;
};

// GossipSchema.statics.deleteAndDissociateFromUser = async function (
//   gossipId: string
// ) {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     //delete a gossip
//     const gossip = await this.findByIdAndDelete(gossipId).session(session);

//     if (!gossip) {
//       await session.abortTransaction();
//       session.endSession();
//       return null;
//     }

// delete from owner's "gossips" array
// await mongoose
//   .model<IUser>("User")
//   .findByIdAndUpdate(gossip.author, { $pull: { gossips: gossipId } })
//   .session(session);

// clean up all likes in users' "likedGossips" array
// await mongoose
//   .model<IUser>("User")
//   .updateMany(
//     { likedGossips: { $in: [gossipId] } },
//     { $pull: { likedGossips: gossipId } }
//   )
//   .session(session);

// get all comments associated with the gossip
// const comments = await mongoose
//   .model<IComment>("Comment")
//   .find({ gossip: gossipId })
//   .session(session);

// remove all likes for these comments from users' "likedComments" array
// const commentIds = comments.map((comment) => comment._id);
// await mongoose
//   .model<IUser>("User")
//   .updateMany(
//     { likedComments: { $in: commentIds } },
//     { $pull: { likedComments: { $in: commentIds } } }
//   )
//   .session(session);

// remove comment IDs from users' "comments" array
// await mongoose
//   .model<IUser>("User")
//   .updateMany(
//     { comments: { $in: commentIds } },
//     { $pull: { comments: { $in: commentIds } } }
//   )
//   .session(session);

// clean up all comments of a gossip
// await mongoose
//   .model<IComment>("Comment")
//   .deleteMany({ gossip: gossipId })
//   .session(session);

//     await session.commitTransaction();
//     session.endSession();
//     return gossip;
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     throw error;
//   }
// };

GossipSchema.statics.likeGossip = async function (
  authorId: string,
  gossipId: string
) {
  await mongoose
    .model("User")
    .findByIdAndUpdate(authorId, { $push: { likedGossips: gossipId } });
  const res = await mongoose
    .model("Gossip")
    .findByIdAndUpdate(gossipId, { $push: { likes: authorId } }, { new: true });
  return res?.likes || null;
};

GossipSchema.statics.unlikeGossip = async function (
  authorId: string,
  gossipId: string
) {
  await mongoose
    .model("User")
    .findByIdAndUpdate(authorId, { $pull: { likedGossips: gossipId } });
  const res = await mongoose
    .model("Gossip")
    .findByIdAndUpdate(gossipId, { $pull: { likes: authorId } }, { new: true });
  return res?.likes || null;
};

GossipSchema.statics.cleanUpUserAssociations = async function (userId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // remove user likes from all gossip
    await this.updateMany(
      { likes: { $in: [userId] } },
      { $pull: { likes: userId } }
    ).session(session);

    // delete all user generated gossips
    await this.deleteMany({ author: userId }).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

GossipSchema.statics.cleanUpCommentAssociations = async function (
  commentId: string
) {
  await this.updateOne(
    { comments: commentId },
    { $pull: { comments: commentId } }
  );
};

GossipSchema.pre("deleteOne", async function (next) {
  try {
    const gossipId = this.getQuery()._id;
    const comments = await Comment.find({ gossip: gossipId });
    const commentIds = comments.map((comment: ICommentModel) => comment._id);

    await User.cleanUpGossipAssociations(gossipId);
    await User.cleanUpCommentAssociations(commentIds);
    await Comment.cleanUpGossipAssociations(gossipId);

    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

const Gossip = mongoose.model<IGossipModel, IGossipModelStatic>(
  "Gossip",
  GossipSchema
);
export default Gossip;
