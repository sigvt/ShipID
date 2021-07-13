import Discord from "discord.js";

export async function checkModPermission(message: Discord.Message) {
  if (message.channel.type !== "text") {
    return false;
  }

  const hasPermission =
    message.channel.permissionsFor(message.author)?.has("MANAGE_CHANNELS") ??
    false;

  return hasPermission;
}
