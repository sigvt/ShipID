import { CommandInteraction, Message } from "discord.js";
import {
  findVerification,
  getRoleMapsForGuild,
  saveVerification,
  updateVerification,
} from "../../db";
import { User } from "../../models/user";
import { Honeybee } from "../../honeybee";
import { log } from "../../util";
import { RoleChangeset } from "../interfaces";

import { DateTime } from "luxon";

export async function getRoleEligibility(
  intr: CommandInteraction,
  user: User,
  hb: Honeybee
): Promise<RoleChangeset[] | undefined> {
  const guildId = intr.guild?.id;
  if (!guildId) {
    log("!guildId");
    return;
  }

  const roleMaps = await getRoleMapsForGuild(guildId);
  if (!roleMaps) {
    log("!roleMaps");
    intr.reply({
      content: "This server is not configured yet. Ask admin first!",
      ephemeral: true,
    });
    return;
  }

  log(
    "roleMaps",
    roleMaps.map((r) => r.roleId)
  );

  let changesets: RoleChangeset[] = [];
  for (const rm of roleMaps) {
    // fetch status from honeybee
    const status = await fetchMembershipStatus({
      hb,
      user,
      originChannelId: rm.originChannelId,
      since: DateTime.now().minus({ days: 30 }).toJSDate(),
    });

    changesets.push({
      roleId: rm.roleId,
      status,
    });
  }
  return changesets;
}

/**
 * Fetch and cache membership status
 */
async function fetchMembershipStatus({
  hb,
  user,
  originChannelId,
  since,
}: {
  hb: Honeybee;
  user: User;
  originChannelId: string;
  since?: Date;
}) {
  const verification = await findVerification({
    user,
    originChannelId,
  });

  if (
    verification &&
    Date.now() - verification.updatedAt!.getTime() < 1000 * 60 * 5
  ) {
    // cache
    log("cache hit", verification);
    return verification.status;
  }

  const newStatus = await hb.getMembershipStatus({
    authorChannelId: user.youtubeChannelId,
    originChannelId,
    since,
  });

  log("new yt status", newStatus);

  const status = {
    isMember: newStatus !== undefined,
    status: newStatus?.status,
    since: newStatus?.since,
  };

  const cache = {
    user,
    originChannelId,
    status,
  };

  if (verification) {
    await updateVerification(cache);
  } else {
    await saveVerification(cache);
  }

  return status;
}
