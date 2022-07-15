import mongoose, { Document } from "mongoose";

export interface Pair extends Document {
  guildId: string;
  roleId: string;
  originChannelId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new mongoose.Schema(
  {
    guildId: { type: String, required: true },
    roleId: { type: String, required: true },
    originChannelId: { type: String, required: true },
  },
  { timestamps: true }
);

schema.index(
  {
    guildId: 1,
    roleId: 1,
    originChannelId: 1,
  },
  {
    unique: true,
  }
);

const PairModel = mongoose.model<Pair>("Pair", schema);

export default PairModel;
