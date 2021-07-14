import { Message } from "discord.js";
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

export async function verificationPhase(
  message: Message,
  user: User,
  hb: Honeybee
): Promise<RoleChangeset[] | undefined> {
  const guildId = message.guild?.id;
  if (!guildId) {
    log("!guildId");
    return;
  }

  const roleMaps = await getRoleMapsForGuild(guildId);
  if (!roleMaps) {
    log("!roleMaps");
    message.reply("This server is not configured yet. Ask admin first!");
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
    });

    changesets.push({
      roleId: rm.roleId,
      status,
    });
  }
  return changesets;
}

async function fetchMembershipStatus({
  hb,
  user,
  originChannelId,
}: {
  hb: Honeybee;
  user: User;
  originChannelId: string;
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

  const ytStatus = await hb.getMembershipStatus(
    user.youtubeChannelId,
    originChannelId
  );

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
