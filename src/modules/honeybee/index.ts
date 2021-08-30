import { BeAnObject, ReturnModelType } from "@typegoose/typegoose/lib/types";
import { Chat } from "./chat";
import connectionFactory from "./db";

export class Honeybee {
  private Chat!: ReturnModelType<typeof Chat, BeAnObject>;

  constructor(mongoUri: string) {
    const { ChatModel } = connectionFactory(mongoUri);
    this.Chat = ChatModel;
  }

  close() {
    return this.Chat.db.close();
  }

  async getMembershipStatus({
    authorChannelId,
    originChannelId,
    since,
  }: {
    authorChannelId: string;
    originChannelId: string;
    since?: Date;
  }) {
    if (!since) {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      since = firstDay;
    }

    const chats = await this.Chat.find(
      {
        timestamp: { $gte: since },
        authorChannelId,
        originChannelId,
      },
      { timestamp: 1, membership: 1 }
    )
      .sort({ timestamp: -1 })
      .limit(1);

    if (chats.length === 0) return undefined;

    return chats[0].membership;
  }
}
