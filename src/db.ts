import UserModel from "./models/user";
import GuildModel from "./models/guild";

export async function getUserByDiscordId(discordId: string) {
  return await UserModel.findOne({ discordId });
}

export async function createUser(discordId: string, youtubeChannelId: string) {
  const user = await getUserByDiscordId(discordId);
  if (user) return user;

  const newUser = await UserModel.create({
    discordId,
    youtubeChannelId,
    lastUpdate: new Date(),
  });

  return newUser;
}

export async function findOrCreateGuild(guildId: string) {
  const guild = await GuildModel.findOne({ guildId });
  if (guild) return guild;

  const newGuild = await GuildModel.create({
    guildId,
    roleMaps: [],
    createdAt: new Date(),
  });

  return newGuild;
}

export async function getRoleMapsForGuild(guildId: string) {
  const guild = await GuildModel.findOne({ guildId });
  if (!guild) return undefined;

  const roleMaps = guild.roleMaps;
  return roleMaps;
}
