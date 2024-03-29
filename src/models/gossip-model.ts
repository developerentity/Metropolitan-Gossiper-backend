import mongoose, { Document, Schema, Model } from "mongoose";

export interface IGossip {
  title: string;
  content: string;
  imageUrl?: string;
  author: string;
  comments: string[];
  likes: string[];
}

export interface IGossipModel extends IGossip, Document {}

export interface IGossipModelStatic extends Model<IGossipModel> {
  createAndAssociateWithUser(gossip: IGossip): Promise<IGossipModel>;
  deleteAndDissociateFromUser(gossipId: string): Promise<IGossipModel | null>;
}

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

export default mongoose.model<IGossipModel, IGossipModelStatic>(
  "Gossip",
  GossipSchema
);
