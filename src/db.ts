import UserModel, { User } from "./models/user";
import GuildModel from "./models/guild";
import VerificationModel, { Status } from "./models/verification";
import { Membership } from "masterchat";

export async function getUserByDiscordId(discordId: string) {
  return await UserModel.findOne({ discordId });
}

export async function createOrUpdateUser(
  discordId: string,
  { youtubeChannelId }: { youtubeChannelId: string }
) {
  const user = await getUserByDiscordId(discordId);
  if (user) {
    user.youtubeChannelId = youtubeChannelId;
    return await user.save();
  }

  const newUser = await UserModel.create({
    discordId,
    youtubeChannelId,
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

export async function findVerification({
  user,
  originChannelId,
}: {
  user: User;
  originChannelId: string;
}) {
  return await VerificationModel.findOne({ user, originChannelId });
}

export interface ModifyVerificationOptions {
  user: User;
  originChannelId: string;
  status: Status;
}

export async function updateVerification({
  user,
  originChannelId,
  status,
}: ModifyVerificationOptions) {
  return await VerificationModel.updateOne(
    { user, originChannelId },
    {
      status,
    }
  );
}

export async function saveVerification({
  user,
  originChannelId,
  status,
}: ModifyVerificationOptions) {
  return await VerificationModel.create({
    user,
    originChannelId,
    status,
  });
}
