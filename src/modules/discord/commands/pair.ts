import { HandlerOptions } from "../interfaces";
import { checkModPermission } from "../util";
import { PREFIX } from "../../../constants";
import { findOrCreateGuild } from "../../../db";

export const pair = {
  // !sid pair <channelId> <role name>
  command: "pair",
  handler: async ({ message, args }: HandlerOptions) => {
    if (!(await checkModPermission(message))) {
      console.log("!checkModPermission", message.author.username);
      return;
    }

    const guild = message.guild;
    if (!guild) {
      console.log("!guild");
      return;
    }

    if (args.length < 2) {
      message.reply(`usage: ${PREFIX} pair \`<channelId>\` \`<role name>\``);
      return;
    }

    const guildData = await findOrCreateGuild(guild.id);

    const originChannelId = args.shift()!;
    const roleName = args.join(" ");
    console.log("channel:", originChannelId, "roleName:", roleName);

    const role = guild.roles.cache.find((r) => r.name === roleName);
    if (!role) {
      console.log("!role");
      message.reply(`couldn't find \`${roleName}\` role`);
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

    const data = await guildData.save();
    console.log(data);

    message.reply([
      `success!`,
      `Role: \`${roleName}\``,
      `Target channel: https://www.youtube.com/channel/${originChannelId}`,
    ]);
  },
};
