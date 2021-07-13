import { getRoleMapsForGuild } from "../../../db";
import { Message } from "discord.js";
import { User } from "../../../models/user";
import { Honeybee } from "../../honeybee";
import { RoleChangeset } from "../interfaces";

export async function verificationPhase(
  message: Message,
  user: User,
  hb: Honeybee
): Promise<RoleChangeset[] | undefined> {
  const guildId = message.guild?.id;
  if (!guildId) return;

  const roleMaps = await getRoleMapsForGuild(guildId);
  if (!roleMaps) return;

  let changesets = [];
  for (const rm of roleMaps) {
    const status = await hb.getMembershipStatus(
      user.youtubeChannelId,
      rm.originChannelId
    );
    const eligible = status !== undefined;

    // TODO: save cache
    changesets.push({
      roleId: rm.roleId,
      eligible,
    });
  }
  return changesets;
}
