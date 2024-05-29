import mongoose, { Document, Model, Schema } from "mongoose";

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

export default mongoose.model<ICommentModel, ICommentModelStatic>(
  "Comment",
  CommentSchema
);
