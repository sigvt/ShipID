import { User } from "@prisma/client";
import { ChatInputCommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { LIFETIME as DAYS_TO_EXPIRE } from "../../constants";
import {
  findAttestation,
  getTiesForGuild,
  getUserByDiscordId,
  upsertAttestation,
} from "../../db";
import { getMembershipStatusFromHoneybee } from "../../notaries/chat";
import { debugLog } from "../../util";
import { State, StateContext } from "../commands/reverify";
import { RoleChangeset } from "../interfaces";

export async function verifyWithChatState(
  intr: ChatInputCommandInteraction,
  context: StateContext
): Promise<[State, StateContext]> {
  const user = intr.user;
  const maybeUser = await getUserByDiscordId(user.id);

  if (!maybeUser) return [State.ONBOARD, {}];

  const guildId = intr.guild?.id;
  if (!guildId) return [State.ERROR, { error: "!guildId" }];

  const pairs = await getTiesForGuild(guildId);

  if (!pairs) {
    debugLog("!pairs");
    intr.reply({
      content: "This server is not configured yet. Ask admin first!",
      ephemeral: true,
    });
    return [State.END, {}];
  }

  debugLog(
    "pairs",
    pairs.map((r) => r.roleId)
  );

  const rolesToChange: RoleChangeset[] = await Promise.all(
    pairs.map(async (rm) => {
      // fetch status from honeybee
      const status = await fetchMembership({
        user: maybeUser,
        originChannelId: rm.originChannelId,
        since: DateTime.now().minus({ days: 30 }).toJSDate(),
      });

      return {
        roleId: rm.roleId,
        isMember: status.isMember,
        since: status.since,
      };
    })
  );

  if (!rolesToChange) return [State.END, {}];

  return [State.APPLY_ROLE_CHANGES, { rolesToChange }];
}

/**
 * Fetch and cache membership status
 */
async function fetchMembership({
  user,
  originChannelId,
  since,
}: {
  user: User;
  originChannelId: string;
  since?: Date;
}) {
  if (!user.youtubeChannelId) {
    throw new Error("Missing YouTube channel id");
  }

  const att = await findAttestation({
    user,
    originChannelId,
  });

  if (
    att &&
    Date.now() - att.attestedAt!.getTime() <
      1000 * 60 * 60 * 24 * DAYS_TO_EXPIRE
  ) {
    // cache
    debugLog("existing valid attestation found:", att);
    return att;
  }

  const newStatus = await getMembershipStatusFromHoneybee({
    authorChannelId: user.youtubeChannelId,
    originChannelId,
    since,
  });

  debugLog("new yt status", newStatus);

  const valid = newStatus !== undefined;
  const memberSince = newStatus?.since;

  return await upsertAttestation({
    user,
    originChannelId,
    isMember: valid,
    since: memberSince,
  });
}
