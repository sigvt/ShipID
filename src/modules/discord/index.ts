import Discord from "discord.js";
import { commands } from "./commands";
import { HB_MONGO_URI } from "/@/constants";
import { Honeybee } from "/@/modules/honeybee";
import { log } from "/@/util";

export function createBot({ prefix }: { prefix: string }) {
  const hb = new Honeybee(HB_MONGO_URI);
  const prefixMatcher = new RegExp(`^${prefix}[\\s$]`);

  async function commandParser(message: Discord.Message) {
    try {
      if (message.author.bot) return;
      if (!prefixMatcher.test(message.content)) return;
      const payload = message.content.slice(prefix.length + 1).split(" ");
      const commandName = payload.shift();
      const args = payload;

      if (!commandName) return;
      log(`command: ${commandName}`, payload);

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
