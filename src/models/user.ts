import mongoose from "mongoose";

export interface User extends mongoose.Document {
  discordId: string;
  youtubeChannelId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new mongoose.Schema(
  {
    discordId: { type: String, required: true, unique: true },
    youtubeChannelId: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const UserModel = mongoose.model<User>("User", schema);

export default UserModel;
