import mongoose, { CallbackError, Document, Model, Schema } from "mongoose";
import User from "./user-model";
import Gossip from "./gossip-model";

export interface IComment {
  content: string;
  author: string;
  gossip: string;
  parent: string | null;
  likes: string[];
}

export interface ICommentModel extends IComment, Document {
  createdAt: Date;
}

export interface ICommentModelStatic extends Model<ICommentModel> {
  createAndAssociateWithUserAndGossip(
    comment: IComment
  ): Promise<ICommentModel>;
  deleteAndDissociateFromUserAndGossip(
    comment: string
  ): Promise<ICommentModel | null>;
  likeComment(authorId: string, commentId: string): Promise<string[] | null>;
  unlikeComment(authorId: string, commentId: string): Promise<string[] | null>;
  cleanUpUserAssociations(userId: string): Promise<void>;
  cleanUpGossipAssociations(gossipId: string): Promise<void>;
}

const CommentSchema: Schema = new Schema(
  {
    content: { type: String, required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    gossip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gossip",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

CommentSchema.statics.createAndAssociateWithUserAndGossip = async function (
  commentData: IComment
) {
  const comment = await this.create(commentData);
  await mongoose
    .model("User")
    .findByIdAndUpdate(comment.author, { $push: { comments: comment._id } });
  await mongoose
    .model("Gossip")
    .findByIdAndUpdate(comment.gossip, { $push: { comments: comment._id } });
  return comment;
};

CommentSchema.statics.deleteAndDissociateFromUserAndGossip = async function (
  commentId: string
) {
  const comment = await this.findByIdAndDelete(commentId);
  await mongoose
    .model("User")
    .findByIdAndUpdate(comment.author, { $pull: { comments: commentId } });
  await mongoose
    .model("Gossip")
    .findByIdAndUpdate(comment.gossip, { $pull: { comments: commentId } });
  return comment;
};

CommentSchema.statics.likeComment = async function (
  authorId: string,
  commentId: string
) {
  await mongoose
    .model("User")
    .findByIdAndUpdate(authorId, { $push: { likedComments: commentId } });
  const res = await mongoose
    .model("Comment")
    .findByIdAndUpdate(
      commentId,
      { $push: { likes: authorId } },
      { new: true }
    );
  return res?.likes || null;
};

CommentSchema.statics.unlikeComment = async function (
  authorId: string,
  commentId: string
) {
  await mongoose
    .model("User")
    .findByIdAndUpdate(authorId, { $pull: { likedComments: commentId } });
  const res = await mongoose
    .model("Comment")
    .findByIdAndUpdate(
      commentId,
      { $pull: { likes: authorId } },
      { new: true }
    );
  return res?.likes || null;
};

CommentSchema.statics.cleanUpUserAssociations = async function (
  userId: string
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // remove user likes from all comments
    await this.updateMany(
      { likes: { $in: [userId] } },
      { $pull: { likes: userId } }
    ).session(session);

    // delete all user created comments
    await this.deleteMany({ author: userId }).session(session);

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

CommentSchema.statics.cleanUpGossipAssociations = async function (
  gossipId: string
) {
  await this.deleteMany({ gossip: gossipId });
};

CommentSchema.pre("deleteOne", async function (next) {
  try {
    const commentId = this.getQuery()._id;

    await User.cleanUpCommentAssociations(commentId);
    await Gossip.cleanUpCommentAssociations(commentId);

    next();
  } catch (err) {
    next(err as CallbackError);
  }
});

const Comment = mongoose.model<ICommentModel, ICommentModelStatic>(
  "Comment",
  CommentSchema
);
export default Comment;
