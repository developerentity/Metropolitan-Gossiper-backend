import mongoose, { Document, Schema } from "mongoose";

export interface IComment {
  content: string;
  author: string;
  gossip: string;
  parent: string | null;
  likes: string[];
}

export interface ICommentModel extends IComment, Document {}

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

export default mongoose.model<ICommentModel>("Comment", CommentSchema);
