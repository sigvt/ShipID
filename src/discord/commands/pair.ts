import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ChannelType,
  ChatInputCommandInteraction,
  CommandInteraction,
  PermissionsBitField,
} from "discord.js";
import { createTie } from "../../db";
import { debugLog } from "../../util";

export default {
  data: new SlashCommandBuilder()
    .setName("pair")
    .setDescription("Pair membership role with YouTube channel")
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
  async execute(intr: ChatInputCommandInteraction) {
    await assertValidModerator(intr);

    const { guild, options } = intr;

    if (!guild) return debugLog("!guild");

    const channel = options.getString("channel")!;
    const role = options.getRole("role")!;

    debugLog("channel:", channel, "roleName:", role);

    const tie = await createTie({
      guildId: guild.id,
      roleId: role.id,
      originChannelId: channel,
    });

    debugLog(tie);

    await intr.reply({
      content: `Success:
Role: \`${role.name}\`
Channel: https://www.youtube.com/channel/${channel}`,
    });
  },
};

async function assertValidModerator(intr: CommandInteraction) {
  if (!(intr.channel && intr.channel.type === ChannelType.GuildText)) {
    throw new Error("Invalid channel");
  }

  const hasPermission =
    intr.channel
      .permissionsFor(intr.user)
      ?.has(PermissionsBitField.Flags.ManageChannels) ?? false;

  if (!hasPermission) {
    throw new Error("You are not allowed to run this command");
  }
}
