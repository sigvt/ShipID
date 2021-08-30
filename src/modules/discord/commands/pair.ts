import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { findOrCreateGuild } from "../../../db";
import { log } from "../../../util";
import { checkModPermission } from "../util";

export default {
  data: new SlashCommandBuilder()
    .setName("pair")
    .setDescription("Pair role with YouTube channel")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("YouTube Channel ID")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("The role to tired with")
        .setRequired(true)
    ),
  async execute(interaction: CommandInteraction) {
    if (!(await checkModPermission(interaction))) {
      console.log("!checkModPermission", interaction.user.username);
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      log("!guild");
      return;
    }

    const channel = interaction.options.getString("channel")!;
    const role = interaction.options.getRole("role")!;

    console.log("channel:", channel, "roleName:", role);

    const guildData = await findOrCreateGuild(guild.id);

    const rm = guildData.roleMaps.find((rm) => rm.roleId === role.id);
    if (rm) {
      rm.originChannelId = channel;
    } else {
      guildData.roleMaps.push({
        roleId: role.id,
        originChannelId: channel,
      });
    }

    const data = await guildData.save();
    log(data);

    interaction.reply({
      content: `success!
Role: \`${role.name}\`
Target channel: https://www.youtube.com/channel/${channel}`,
    });
  },
};
