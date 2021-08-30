import Discord, { CommandInteraction } from "discord.js";

export async function checkModPermission(intr: CommandInteraction) {
  if (!(intr.channel && intr.channel.type === "GUILD_TEXT")) {
    return false;
  }

  const hasPermission =
    intr.channel.permissionsFor(intr.user)?.has("MANAGE_CHANNELS") ?? false;

  return hasPermission;
}
