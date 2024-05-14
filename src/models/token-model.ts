import mongoose, { ObjectId, Schema } from "mongoose";

export interface IToken {
  userId: ObjectId;
  token: string;
  expirationDate: Date;
  sentEmails?: Date[];
  registrationData?: {
    ip: string;
  };
}

export interface ITokenModel extends IToken, Document {
  _id: ObjectId;
}

const TokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  sentEmails: [
    {
      type: Date,
      default: [],
    },
  ],
  registrationData: {
    ip: {
      type: String,
    },
  },
});

export default mongoose.model<ITokenModel>("Token", TokenSchema);
