import { Attestation, PrismaClient, Tie, User } from "@prisma/client";

export interface AttestationOptions {
  user: User;
  originChannelId: string;
  isMember: boolean;
  since?: string;
}

const client = new PrismaClient();

export async function getUserByDiscordId(discordId: string) {
  return await client.user.findFirst({ where: { discordId } });
}

export async function upsertUser({
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

export async function createTie({
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

export async function getTiesForGuild(guildId: string): Promise<Tie[]> {
  const pairs = await client.tie.findMany({ where: { guildId } });
  return pairs;
}

export async function findAttestation({
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

export async function upsertAttestation({
  user,
  originChannelId,
  isMember,
  since,
}: AttestationOptions): Promise<Attestation> {
  const cert = await findAttestation({ user, originChannelId });
  if (cert) {
    const updated = await client.attestation.update({
      where: { id: cert.id },
      data: {
        isMember,
        since: since ?? null,
      },
    });
    return updated;
  }

  const newCert = await client.attestation.create({
    data: {
      user: {
        connect: { discordId: user.discordId },
      },
      originChannelId,
      isMember,
      since,
    },
  });

  return newCert;
}
