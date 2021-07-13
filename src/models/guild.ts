import mongoose from "mongoose";

export interface RoleMap {
  roleId: string;
  originChannelId: string;
}

export interface Guild {
  guildId: string;
  roleMaps: RoleMap[];
  createdAt: string;
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
