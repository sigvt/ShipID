import mongoose, { Schema } from "mongoose";
import { User } from "./user";

export interface Status {
  isMember: boolean;
  status?: string;
  since?: string;
}

export interface Verification extends mongoose.Document {
  user: User;
  originChannelId: string;
  status: Status;
  updatedAt?: Date;
  createdAt?: Date;
}

const schema = new mongoose.Schema(
  {
    user: { type: "ObjectId", ref: "User", required: true },
    originChannelId: { type: String, required: true },
    status: Schema.Types.Mixed,
  },
  { timestamps: true }
);

schema.index({ user: 1, originChannelId: 1 }, { unique: true });

const VerificationModel = mongoose.model<Verification>("Verification", schema);

export default VerificationModel;
