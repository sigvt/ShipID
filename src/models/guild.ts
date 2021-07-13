import mongoose, { Document } from "mongoose";

export interface RoleMap {
  roleId: string;
  originChannelId: string;
}

export interface Guild extends Document {
  guildId: string;
  roleMaps: RoleMap[];
  createdAt?: Date;
}

const schema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  roleMaps: [
    {
      roleId: String,
      originChannelId: String,
    },
  ],
  createdAt: { type: Date, default: Date.now(), required: true },
});

const GuildModel = mongoose.model<Guild>("Guild", schema);

export default GuildModel;
