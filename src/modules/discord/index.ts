import Discord from "discord.js";
import { HB_MONGO_URI } from "../../constants";
import { log } from "../../util";
import { Honeybee } from "../honeybee";
import { commands } from "./commands";

export function createBot({ prefix }: { prefix: string }) {
  const hb = new Honeybee(HB_MONGO_URI);

  async function commandParser(message: Discord.Message) {
    try {
      if (message.author.bot) return;
      console.log("message:", message.content);
      if (!message.content.startsWith(prefix)) return;
      const payload = message.content.slice(prefix.length + 1).split(" ");
      const commandName = payload.shift();
      const args = payload;

      if (!commandName) return;
      console.log(`command: ${commandName}`, payload);

      const command = commands.find(
        (command) => command.command === commandName
      );
      if (!command) {
        return message.reply(`unrecognized command: ${commandName}`);
      }

      await command.handler({ message, command: commandName, args, hb });
    } catch (err) {
      console.log(err);
      await message.reply(err.message);
    }
  }

  const client = new Discord.Client();

  client.once("ready", () => {
    console.log("ready");
  });

  client.on("guildDelete", async (guild) => {
    log("guildDelete");
    // const invalidSubs = await removeSubscriptionForGuild(guild.id);
  });

  client.on("channelDelete", async (channel) => {
    log("channelDelete");
    // const invalidSubs = await removeSubscriptionForChannel(channel.id);
  });

  client.on("message", commandParser);

  return client;
}
