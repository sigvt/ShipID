import { CommandInteraction } from "discord.js";
import { RoleChangeset } from "../interfaces";

export async function applyRoles(
  intr: CommandInteraction,
  roleChangesets: RoleChangeset[]
) {
  const guild = intr.guild;
  if (!guild) return console.log("!guild");

  const member = intr.guild?.members.cache.find(
    (m) => m.user.tag === intr.user.tag
  );
  if (!member) return console.log("!member");

  for (const rcs of roleChangesets) {
    const role = await guild.roles.fetch(rcs.roleId);
    if (!role) return console.log("!role", rcs.roleId);

    try {
      if (rcs.status.isMember) {
        await member.roles.add(role);
      } else {
        await member.roles.remove(role);
      }
    } catch (err: any) {
      console.log("Error while modifying role: " + err.message);
    }
  }
}
