import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
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
    role: {
      type: String,
      default: "Basic",
      required: true,
    },
    likedGossips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Gossip" }],
    likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
