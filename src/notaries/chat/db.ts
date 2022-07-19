import { getModelForClass } from "@typegoose/typegoose";
import mongoose from "mongoose";
import { Chat } from "./chat";

export default function connectionFactory(uri: string) {
  const conn = mongoose.createConnection(uri);

  const ChatModel = getModelForClass(Chat, { existingConnection: conn });

  return { ChatModel };
}
