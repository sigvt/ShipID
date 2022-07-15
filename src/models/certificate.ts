import mongoose, { Schema } from "mongoose";
import { User } from "./user";

export interface Certificate extends mongoose.Document {
  user: User;
  originChannelId: string;
  valid: boolean;
  since?: string;

  updatedAt?: Date;
  createdAt?: Date;
}

const schema = new mongoose.Schema(
  {
    user: { type: "ObjectId", ref: "User", required: true },
    originChannelId: { type: String, required: true },
    valid: { type: Boolean, required: true },
    since: String,
  },
  { timestamps: true }
);

schema.index({ user: 1, originChannelId: 1 }, { unique: true });

const CertificateModel = mongoose.model<Certificate>("Certificate", schema);

export default CertificateModel;
