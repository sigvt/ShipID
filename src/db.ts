import { Attestation, PrismaClient, Tie, User } from "@prisma/client";

const client = new PrismaClient();

export async function getUserByDiscordId(discordId: string) {
  return await client.user.findFirst({ where: { discordId } });
}

export async function createOrUpdateUser({
  discordId,
  youtubeChannelId,
}: {
  discordId: string;
  youtubeChannelId: string;
}) {
  const newOrUpdatedUser = await client.user.upsert({
    where: { discordId },
    update: { youtubeChannelId },
    create: {
      discordId,
      youtubeChannelId,
    },
  });

  return newOrUpdatedUser;
}

export async function createPair({
  guildId,
  roleId,
  originChannelId,
}: {
  guildId: string;
  roleId: string;
  originChannelId: string;
}): Promise<Tie> {
  const pair = await client.tie.create({
    data: { guildId, roleId, originChannelId },
  });
  return pair;
}

export async function getPairsForGuild(guildId: string): Promise<Tie[]> {
  const pairs = await client.tie.findMany({ where: { guildId } });
  return pairs;
}

export async function findCertificate({
  user,
  originChannelId,
}: {
  user: User;
  originChannelId: string;
}): Promise<Attestation | null> {
  return await client.attestation.findFirst({
    where: { user, originChannelId },
  });
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
}: ModifyOptions): Promise<Attestation> {
  const cert = await findCertificate({ user, originChannelId });
  if (cert) {
    const updated = await client.attestation.update({
      where: { id: cert.id },
      data: {
        valid,
        since: since ?? null,
      },
    });
    return updated;
  }

  const newCert = await client.attestation.create({
    data: {
      user: {
        connect: user,
      },
      originChannelId,
      valid,
      since,
    },
  });

  return newCert;
}
