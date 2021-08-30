import { CommandInteraction, Message } from "discord.js";
import { RoleChangeset } from "../interfaces";

export async function applyRolesPhase(
  intr: CommandInteraction,
  roleChangesets: RoleChangeset[]
) {
  const guild = intr.guild;
  if (!guild) {
    console.log("!guild");
    return;
  }

  const member = intr.guild?.members.cache.find(
    (m) => m.user.tag === intr.user.tag
  );
  if (!member) {
    console.log("!member");
    return;
  }

  for (const rcs of roleChangesets) {
    const role = await guild.roles.fetch(rcs.roleId);
    if (!role) {
      console.log("!role", rcs.roleId);
      return;
    }

    try {
      if (rcs.status.isMember) {
        console.log(await member.roles.add(role));
      } else {
        console.log(await member.roles.remove(role));
      }
    } catch (err) {
      console.log("Error while modifying role: " + err.message);
    }
  }
}
