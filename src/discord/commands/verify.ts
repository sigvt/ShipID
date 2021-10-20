import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, User } from "discord.js";
import { getUserByDiscordId } from "../../db";
import { log } from "../../util";
import { Command, RoleChangeset } from "../interfaces";
import { applyRoles } from "../phases/applyRoles";
import { onboardingPhase } from "../phases/onboarding";
import { getRoleEligibility } from "../phases/verification";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify membership status"),

  async execute(intr: CommandInteraction, { hb }) {
    log("verify", intr.user.username);

    const user = intr.user;
    const maybeUser = await getUserByDiscordId(user.id);

    if (!maybeUser) {
      // new user
      return onboardingPhase(user);
    }

    const rolesToChange = await getRoleEligibility(intr, maybeUser, hb);
    if (!rolesToChange) return;

    // apply roles
    log("roleChangesets", rolesToChange);
    await applyRoles(intr, rolesToChange);

    // report
    await report(intr, user, rolesToChange);
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
