import mongoose, { Document, Schema } from "mongoose";

export interface RoleMap {
  roleId: string;
  originChannelId: string;
}

export interface Guild extends Document {
  guildId: string;
  roleMaps: RoleMap[];
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new mongoose.Schema(
  {
    guildId: { type: String, required: true, unique: true },
    roleMaps: [
      {
        roleId: String,
        originChannelId: String,
      },
    ],
  },
  { timestamps: true }
);

const GuildModel = mongoose.model<Guild>("Guild", schema);

export default GuildModel;
