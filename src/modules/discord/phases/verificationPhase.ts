import { Message } from "discord.js";
import { RoleChangeset } from "../interfaces";
import { getRoleMapsForGuild } from "../../../db";
import { User } from "../../../models/user";
import { Honeybee } from "../../../modules/honeybee";

export async function verificationPhase(
  message: Message,
  user: User,
  hb: Honeybee
): Promise<RoleChangeset[] | undefined> {
  const guildId = message.guild?.id;
  if (!guildId) {
    console.log("!guildId");
    return;
  }

  const roleMaps = await getRoleMapsForGuild(guildId);
  if (!roleMaps) {
    console.log("!roleMaps");
    message.reply("This server is not configured yet. Ask admin first!");
    return;
  }

  let changesets = [];
  for (const rm of roleMaps) {
    const status = await hb.getMembershipStatus(
      user.youtubeChannelId,
      rm.originChannelId
    );
    console.log("yt status", status);
    const eligible = status !== undefined;

    // TODO: save cache
    changesets.push({
      roleId: rm.roleId,
      eligible,
    });
  }
  return changesets;
}
