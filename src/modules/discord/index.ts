import { Client, Intents } from "discord.js";
import { HB_MONGO_URI } from "../../constants";
import { Honeybee } from "../../modules/honeybee";
import { log } from "../../util";
import { commands } from "./commands";
import { CommandContext } from "./interfaces";

export function createBot() {
  const hb = new Honeybee(HB_MONGO_URI);

  const context: CommandContext = { hb };

  const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.find(
      (command) => command.data.name === interaction.commandName
    );

    if (!command) return;

    try {
      await command.execute(interaction, context);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });

  client.once("ready", () => {
    console.log("ready");
  });

  client.on("guildDelete", async (guild) => {
    log("guildDelete", guild);
    // const invalidSubs = await removeSubscriptionForGuild(guild.id);
  });

  client.on("channelDelete", async (channel) => {
    log("channelDelete", channel);
    // const invalidSubs = await removeSubscriptionForChannel(channel.id);
  });

  return client;
}
