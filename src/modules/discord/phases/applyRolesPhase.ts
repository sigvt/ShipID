import { Message } from "discord.js";
import { RoleChangeset } from "../interfaces";

export async function applyRolesPhase(
  message: Message,
  roleChangesets: RoleChangeset[]
) {
  const guild = message.guild;
  if (!guild) {
    console.log("!guild");
    return;
  }

  const member = message.member;
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
      if (rcs.isMember) {
        await member.roles.add(role);
      } else {
        await member.roles.remove(role);
      }
    } catch (err) {
      console.log("Error while modifying role: " + err.message);
    }
  }
}
