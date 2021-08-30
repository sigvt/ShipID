import { CommandInteraction, Message } from "discord.js";
import {
  findVerification,
  getRoleMapsForGuild,
  saveVerification,
  updateVerification,
} from "../../../db";
import { User } from "../../../models/user";
import { Honeybee } from "../../../modules/honeybee";
import { log } from "../../../util";
import { RoleChangeset } from "../interfaces";

import { DateTime } from "luxon";
import { HB_MONGO_URI } from "../../../constants";

const hb = new Honeybee(HB_MONGO_URI);

export async function verificationPhase(
  intr: CommandInteraction,
  user: User
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
  const existingVerification = await findVerification({
    user,
    originChannelId,
  });

  if (
    existingVerification &&
    Date.now() - existingVerification.updatedAt!.getTime() < 1000 * 60 * 5
  ) {
    // cache
    log("cache hit", existingVerification);
    return existingVerification.status;
  }

  const ytStatus = await hb.getMembershipStatus({
    authorChannelId: user.youtubeChannelId,
    originChannelId,
    since,
  });

  log("yt status", ytStatus);

  const isMember = ytStatus !== undefined;

  const status = {
    isMember,
    status: ytStatus?.status,
    since: ytStatus?.since,
  };

  const cache = {
    user,
    originChannelId,
    status,
  };

  if (existingVerification) {
    await updateVerification(cache);
  } else {
    await saveVerification(cache);
  }

  return status;
}
