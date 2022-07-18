import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, User } from "discord.js";
import { getUserByDiscordId } from "../../db";
import { debugLog } from "../../util";
import { Command, RoleChangeset } from "../interfaces";
import { applyRoles } from "../phases/applyRoles";
import { onboardingPhase } from "../phases/onboarding";
import { getRoleEligibility } from "../phases/verification";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify membership status"),

  async execute(intr, { hb }) {
    debugLog("verify", intr.user.username);

    const user = intr.user;
    const maybeUser = await getUserByDiscordId(user.id);

    if (!maybeUser) {
      // new user
      return onboardingPhase(user);
    }

    const rolesToChange = await getRoleEligibility(intr, maybeUser, hb);
    if (!rolesToChange) return;

    // apply roles
    debugLog("roleChangesets", rolesToChange);
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
  const embed = new EmbedBuilder()
    .setColor(0x2ba640)
    .setTitle("Membership Verification Result")
    .setDescription(`Here is the verification result for ${user}`)
    .setTimestamp(new Date());

  embed.addFields(
    await Promise.all(
      roleChangesets.map(async (cs) => {
        const role = (await intr.guild!.roles.fetch(cs.roleId))!;
        return {
          name: role.name,
          value: cs.valid
            ? `✅ Member ${cs.since ? ` (${cs.since})` : ""}`
            : "Non-member",
        };
      })
    )
  );

  await intr.reply({ embeds: [embed] });
}

export default command;
