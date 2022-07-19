import { User } from "@prisma/client";
import { ChatInputCommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { LIFETIME as DAYS_TO_EXPIRE } from "../../constants";
import {
  upsertAttestation,
  findAttestation,
  getTiesForGuild,
  getUserByDiscordId,
} from "../../db";
import { getMembershipStatusFromHoneybee, Honeybee } from "../../notaries/chat";
import { debugLog } from "../../util";
import { StateContext, State } from "../commands/reverify";
import { RoleChangeset } from "../interfaces";

export async function verifyWithCommentState(
  intr: ChatInputCommandInteraction,
  context: StateContext
): Promise<[State, StateContext]> {
  const user = intr.user;
  const maybeUser = await getUserByDiscordId(user.id);

  if (!maybeUser) return [State.ONBOARD, {}];

  const rolesToChange = await getRoleEligibility(intr, maybeUser);

  if (!rolesToChange) return [State.END, {}];

  return [State.APPLY_ROLE_CHANGES, { rolesToChange }];
}

async function getRoleEligibility(
  intr: ChatInputCommandInteraction,
  user: User
): Promise<RoleChangeset[] | undefined> {
  const guildId = intr.guild?.id;
  if (!guildId) {
    debugLog("!guildId");
    return;
  }

  const pairs = await getTiesForGuild(guildId);

  if (!pairs) {
    debugLog("!pairs");
    intr.reply({
      content: "This server is not configured yet. Ask admin first!",
      ephemeral: true,
    });
    return;
  }

  debugLog(
    "pairs",
    pairs.map((r) => r.roleId)
  );

  let changesets: RoleChangeset[] = [];
  for (const rm of pairs) {
    // fetch status from honeybee
    const status = await fetchMembership({
      user,
      originChannelId: rm.originChannelId,
      since: DateTime.now().minus({ days: 30 }).toJSDate(),
    });

    changesets.push({
      roleId: rm.roleId,
      isMember: status.isMember,
      since: status.since,
    });
  }
  return changesets;
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
