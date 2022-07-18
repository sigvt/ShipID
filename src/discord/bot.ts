import { Client, GatewayIntentBits } from "discord.js";
import { HONEYBEE_URI } from "../constants";
import { Honeybee } from "../honeybee";
import { debugLog, log } from "../util";
import { commands } from "./commands";
import { CommandContext } from "./interfaces";

export function createBot() {
  const hb = new Honeybee(HONEYBEE_URI);

  const context: CommandContext = { hb };

  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

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
    log("discord", "ready");
  });

  client.on("guildDelete", async (guild) => {
    debugLog("guildDelete", guild);
    // const invalidSubs = await removeSubscriptionForGuild(guild.id);
  });

  client.on("channelDelete", async (channel) => {
    debugLog("channelDelete", channel);
    // const invalidSubs = await removeSubscriptionForChannel(channel.id);
  });

  return client;
}
