import mongoose from "mongoose";
import { User } from "./user";

export interface Verification {
  user: User;
  originChannelId: string;
  status: {
    isMember: boolean;
    duration: string;
  };
  updatedAt: Date;
}

const schema = new mongoose.Schema({
  user: { type: "ObjectId", ref: "User", required: true },
  originChannelId: { type: String, required: true },
  status: {
    isMember: { type: Boolean, required: true },
    duration: { type: String, required: true },
  },
  checkedAt: { type: Date, default: Date.now, required: true },
});

schema.index({ user: 1, originChannelId: 1 }, { unique: true });

const VerificationModel = mongoose.model<Verification>("Verification", schema);

export default VerificationModel;
