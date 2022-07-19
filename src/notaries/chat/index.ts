import { BeAnObject, ReturnModelType } from "@typegoose/typegoose/lib/types";
import { HONEYBEE_URI } from "../../constants";
import { debugLog } from "../../util";
import { Chat } from "./chat";
import connectionFactory from "./db";

export interface GetMembershipStatusOptions {
  authorChannelId: string;
  originChannelId: string;
  since?: Date;
}

var instance: Honeybee;

export async function getMembershipStatusFromHoneybee(
  options: GetMembershipStatusOptions
) {
  if (!instance) {
    instance = new Honeybee(HONEYBEE_URI);
  }

  return instance.getMembershipStatus(options);
}

export class Honeybee {
  private Chat!: ReturnModelType<typeof Chat, BeAnObject>;

  constructor(mongoUri: string) {
    debugLog("Honeybee instantiated");
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
  }: GetMembershipStatusOptions) {
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
