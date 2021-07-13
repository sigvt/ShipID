import { findOrCreateGuild } from "../../../db";
import { HandlerOptions } from "../interfaces";
import { checkModPermission } from "../util";

export const pairRole = {
  // !sid pairRole <channelId> <role name>
  command: "pairRole",
  handler: async ({ message, args }: HandlerOptions) => {
    if (!(await checkModPermission(message))) return;

    const guild = message.guild;
    if (!guild) return;

    const guildData = await findOrCreateGuild(guild.id);

    const [originChannelId, roleName] = args;

    const role = guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      message.reply("Role not found");
      return;
    }

    const rm = guildData.roleMaps.find((rm) => rm.roleId === role.id);
    if (rm) {
      rm.originChannelId = originChannelId;
    } else {
      guildData.roleMaps.push({
        roleId: role.id,
        originChannelId,
      });
    }

    await guildData.save();
  },
};
