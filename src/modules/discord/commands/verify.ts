import { Message, MessageEmbed, User } from "discord.js";
import { PREFIX } from "../../../constants";
import { getUserByDiscordId } from "../../../db";
import { log } from "../../../util";
import { HandlerOptions, RoleChangeset } from "../interfaces";
import { applyRolesPhase } from "../phases/applyRolesPhase";
import { onboardingPhase } from "../phases/onboardingPhase";
import { verificationPhase } from "../phases/verificationPhase";
import { checkModPermission } from "../util";

export const verify = {
  command: "verify",
  handler: async ({ message, hb }: HandlerOptions) => {
    log("verify", message.author.username);

    let user = message.author;
    const mentioned = message.mentions.users.first();
    if (mentioned) {
      if ((await checkModPermission(message)) && !mentioned.bot) {
        user = mentioned;
      } else {
        await message.reply("You are not allowed for this usage");
        return;
      }
    }

    const maybeUser = await getUserByDiscordId(user.id);
    log("maybeUser", maybeUser?.discordId);

    if (!maybeUser) {
      // new user
      return onboardingPhase(user);
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
    await report(message, user, roleChangesets);
  },
};

async function report(
  message: Message,
  user: User,
  roleChangesets: RoleChangeset[]
) {
  const embed = new MessageEmbed()
    .setColor("#2BA640")
    .setTitle("Membership Verification Result")
    .setDescription(["Here is the verification result for", user])
    .setTimestamp(new Date());

  for (const cs of roleChangesets) {
    const role = (await message.guild!.roles.fetch(cs.roleId))!;
    embed.addField(
      role.name,
      cs.status.isMember
        ? `✅ ${cs.status.status}${
            cs.status.since ? ` (${cs.status.since})` : ""
          }`
        : "Non-member"
    );
  }

  await message.reply(embed);
}
