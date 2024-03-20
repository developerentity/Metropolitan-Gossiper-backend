import mongoose, { Document, Schema } from "mongoose";

export interface IGossip {
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  comments: string[];
  likes: string[];
}

export interface IGossipModel extends IGossip, Document {}

const GossipSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    imageUrl: String,
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

export default mongoose.model<IGossipModel>("Gossip", GossipSchema);
