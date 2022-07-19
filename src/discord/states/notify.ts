import { EmbedBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { StateContext, State } from "../commands/reverify";

export async function notifyState(
  intr: CommandInteraction,
  { rolesToChange }: StateContext
): Promise<[State, StateContext]> {
  const embed = new EmbedBuilder()
    .setColor(0x2ba640)
    .setTitle("Membership Verification Result")
    .setDescription(`Here is the verification result for ${intr.user}`)
    .setTimestamp(new Date());

  embed.addFields(
    await Promise.all(
      rolesToChange!.map(async (cs) => {
        const role = (await intr.guild!.roles.fetch(cs.roleId))!;
        return {
          name: role.name,
          value: cs.isMember
            ? `✅ Member ${cs.since ? ` (${cs.since})` : ""}`
            : "Non-member",
        };
      })
    )
  );

  await intr.reply({ embeds: [embed] });

  return [State.END, {}];
}
