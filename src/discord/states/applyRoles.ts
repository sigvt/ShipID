import { CommandInteraction } from "discord.js";
import { errorLog } from "../../util";
import { State, StateContext } from "../commands/reverify";

export async function applyRoleChangesState(
  intr: CommandInteraction,
  { rolesToChange }: StateContext
): Promise<[State, StateContext]> {
  const guild = intr.guild;
  if (!guild) return [State.ERROR, { error: "!guild" }];

  const member = intr.guild?.members.cache.find(
    (m) => m.user.tag === intr.user.tag
  );
  if (!member) return [State.ERROR, { error: "!member" }];

  for (const rcs of rolesToChange!) {
    const role = await guild.roles.fetch(rcs.roleId);
    if (!role) return [State.ERROR, { error: `!role: ${rcs.roleId}` }];

    try {
      if (rcs.isMember) {
        await member.roles.add(role);
      } else {
        await member.roles.remove(role);
      }
    } catch (err: any) {
      errorLog("applyRoles", "Error while modifying role: " + err.message);
    }
  }

  return [State.END, {}];
}
