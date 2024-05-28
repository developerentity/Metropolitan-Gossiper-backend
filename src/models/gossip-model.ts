import mongoose, { Document, Schema, Model } from "mongoose";

export interface IGossip {
  title: string;
  content: string;
  imageName: string | null | undefined;
  author: string;
  comments: string[];
  likes: string[];
}

export interface IGossipModel extends IGossip, Document {}

export interface IGossipModelStatic extends Model<IGossipModel> {
  createAndAssociateWithUser(gossip: IGossip): Promise<IGossipModel>;
  deleteAndDissociateFromUser(gossipId: string): Promise<IGossipModel | null>;
  likeGossip(authorId: string, gossipId: string): Promise<string[] | null>;
  unlikeGossip(authorId: string, gossipId: string): Promise<string[] | null>;
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

GossipSchema.statics.deleteAndDissociateFromUser = async function (
  gossipId: string
) {
  const gossip = await this.findByIdAndDelete(gossipId);
  await mongoose
    .model("User")
    .findByIdAndUpdate(
      gossip.author,
      { $pull: { gossips: gossipId } },
      { new: true }
    );
  return gossip;
};

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

export default mongoose.model<IGossipModel, IGossipModelStatic>(
  "Gossip",
  GossipSchema
);
