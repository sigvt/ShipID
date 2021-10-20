import { CommandInteraction } from "discord.js";

export async function assertValidModerator(intr: CommandInteraction) {
  if (!(intr.channel && intr.channel.type === "GUILD_TEXT")) {
    throw new Error("Invalid channel");
  }

  const hasPermission =
    intr.channel.permissionsFor(intr.user)?.has("MANAGE_CHANNELS") ?? false;

  if (!hasPermission) {
    throw new Error("You are not allowed to run this command");
  }
}
