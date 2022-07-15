import { CommandInteraction } from "discord.js";
import { DateTime } from "luxon";
import { LIFETIME } from "../../constants";
import {
  createOrUpdateCertificate,
  findCertificate,
  getPairsForGuild,
} from "../../db";
import { Honeybee } from "../../honeybee";
import { User } from "../../models/user";
import { log } from "../../util";
import { RoleChangeset } from "../interfaces";

export async function getRoleEligibility(
  intr: CommandInteraction,
  user: User,
  hb: Honeybee
): Promise<RoleChangeset[] | undefined> {
  const guildId = intr.guild?.id;
  if (!guildId) {
    log("!guildId");
    return;
  }

  const pairs = await getPairsForGuild(guildId);
  if (!pairs) {
    log("!pairs");
    intr.reply({
      content: "This server is not configured yet. Ask admin first!",
      ephemeral: true,
    });
    return;
  }

  log(
    "pairs",
    pairs.map((r) => r.roleId)
  );

  let changesets: RoleChangeset[] = [];
  for (const rm of pairs) {
    // fetch status from honeybee
    const status = await fetchMembership({
      hb,
      user,
      originChannelId: rm.originChannelId,
      since: DateTime.now().minus({ days: 30 }).toJSDate(),
    });

    changesets.push({
      roleId: rm.roleId,
      valid: status.valid,
      since: status.since,
    });
  }
  return changesets;
}

/**
 * Fetch and cache membership status
 */
async function fetchMembership({
  hb,
  user,
  originChannelId,
  since,
}: {
  hb: Honeybee;
  user: User;
  originChannelId: string;
  since?: Date;
}) {
  const certificate = await findCertificate({
    user,
    originChannelId,
  });

  if (
    certificate &&
    Date.now() - certificate.updatedAt!.getTime() <
      1000 * 60 * 60 * 24 * LIFETIME
  ) {
    // cache
    log("cache hit", certificate);
    return certificate;
  }

  const newStatus = await hb.getMembershipStatus({
    authorChannelId: user.youtubeChannelId,
    originChannelId,
    since,
  });

  log("new yt status", newStatus);

  const valid = newStatus !== undefined;
  const memberSince = newStatus?.since;

  return await createOrUpdateCertificate({
    user,
    originChannelId,
    valid,
    since: memberSince,
  });
}
