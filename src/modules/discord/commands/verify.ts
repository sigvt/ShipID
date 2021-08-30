import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { PREFIX } from "../../../constants";
import { getUserByDiscordId } from "../../../db";
import { log } from "../../../util";
import { Command, RoleChangeset } from "../interfaces";
import { applyRolesPhase } from "../phases/applyRolesPhase";
import { onboardingPhase } from "../phases/onboardingPhase";
import { verificationPhase } from "../phases/verificationPhase";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify membership status"),
  async execute(intr: CommandInteraction, { hb }) {
    log("verify", intr.user.username);
    log(intr.options);

    const user = intr.user;
    const isDM = intr.guild == null;

    const maybeUser = await getUserByDiscordId(user.id);
    log("maybeUser", maybeUser?.discordId);

    if (!maybeUser) {
      // new user
      return onboardingPhase(user);
    }

    if (isDM) {
      intr.reply({
        content: `User YouTube account has been successfully verified. Type \`${PREFIX} verify\` again on the server where you want member-specific roles.`,
      });
      return;
    }

    const roleChangesets = await verificationPhase(intr, maybeUser, hb);

    if (!roleChangesets) {
      log("!roleChangesets");
      return;
    }

    // apply roles
    log("roleChangesets", roleChangesets);
    await applyRolesPhase(intr, roleChangesets);

    // report
    await report(intr, user, roleChangesets);
  },
};

async function report(
  intr: CommandInteraction,
  user: User,
  roleChangesets: RoleChangeset[]
) {
  const embed = new MessageEmbed()
    .setColor("#2BA640")
    .setTitle("Membership Verification Result")
    .setDescription(`Here is the verification result for ${user}`)
    .setTimestamp(new Date());

  for (const cs of roleChangesets) {
    const role = (await intr.guild!.roles.fetch(cs.roleId))!;
    embed.addField(
      role.name,
      cs.status.isMember
        ? `✅ ${cs.status.status}${
            cs.status.since ? ` (${cs.status.since})` : ""
          }`
        : "Non-member"
    );
  }

  await intr.reply({ embeds: [embed] });
}

export default command;
