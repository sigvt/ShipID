import PairModel, { Pair } from "./models/pair";
import UserModel, { User } from "./models/user";
import CertificateModel, { Certificate } from "./models/certificate";

export async function getUserByDiscordId(discordId: string) {
  return await UserModel.findOne({ discordId });
}

export async function createOrUpdateUser({
  discordId,
  youtubeChannelId,
}: {
  discordId: string;
  youtubeChannelId: string;
}) {
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

export async function createPair({
  guildId,
  roleId,
  originChannelId,
}: {
  guildId: string;
  roleId: string;
  originChannelId: string;
}): Promise<Pair> {
  const pair = await PairModel.create({ guildId, roleId, originChannelId });
  return pair;
}

export async function getPairsForGuild(guildId: string): Promise<Pair[]> {
  const pairs = await PairModel.find({ guildId });
  return pairs;
}

export async function findCertificate({
  user,
  originChannelId,
}: {
  user: User;
  originChannelId: string;
}): Promise<Certificate | null> {
  return await CertificateModel.findOne({ user, originChannelId });
}

export interface ModifyOptions {
  user: User;
  originChannelId: string;
  valid: boolean;
  since?: string;
}

export async function createOrUpdateCertificate({
  user,
  originChannelId,
  valid,
  since,
}: ModifyOptions): Promise<Certificate> {
  const cert = await findCertificate({ user, originChannelId });
  if (cert) {
    cert.valid = valid;
    cert.since = since;
    return await cert.save();
  }

  const newCert = await CertificateModel.create({
    user,
    originChannelId,
    valid,
    since,
  });

  return newCert;
}
