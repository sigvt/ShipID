import { Message, MessageEmbed } from "discord.js";
import { PREFIX } from "../../../constants";
import { getUserByDiscordId } from "../../../db";
import { log } from "../../../util";
import { HandlerOptions, RoleChangeset } from "../interfaces";
import { applyRolesPhase } from "../phases/applyRolesPhase";
import { onboardingPhase } from "../phases/onboardingPhase";
import { verificationPhase } from "../phases/verificationPhase";

export const verify = {
  command: "verify",
  handler: async ({ message, hb }: HandlerOptions) => {
    log("verify", message.author.username);

    const maybeUser = await getUserByDiscordId(message.author.id);
    log("maybeUser", maybeUser?.discordId);

    if (!maybeUser) {
      // new user
      return onboardingPhase(message);
    }

    const isDM = message.guild == null;
    if (isDM) {
      message.reply(
        `User YouTube account has been successfully verified. Type \`${PREFIX} verify\` again on the server where you want member-specific roles.`
      );
      return;
    }

    const roleChangesets = await verificationPhase(message, maybeUser, hb);

    if (!roleChangesets) {
      log("!roleChangesets");
      return;
    }

    // apply roles
    log("roleChangesets", roleChangesets);
    await applyRolesPhase(message, roleChangesets);

    // report
    await report(message, roleChangesets);
  },
};

async function report(message: Message, roleChangesets: RoleChangeset[]) {
  const embed = new MessageEmbed()
    .setColor("#2BA640")
    .setTitle("Membership Verification Result")
    .setDescription(["Here is the verification result for", message.author])
    .setTimestamp(new Date());

  for (const cs of roleChangesets) {
    const role = (await message.guild!.roles.fetch(cs.roleId))!;
    embed.addField(
      role.name,
      cs.status.isMember
        ? `${cs.status.status} (${cs.status.since})`
        : "Non-member"
    );
  }

  await message.reply(embed);
}
