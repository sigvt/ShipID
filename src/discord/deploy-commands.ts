import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { DISCORD_CLIENT_ID, DISCORD_TOKEN } from "../constants";
import { commands } from "./commands";

const guildId = process.env.DISCORD_GUILD_ID!;

const serializedCommands = commands.map((command) => command.data.toJSON());

const rest = new REST({ version: "9" }).setToken(DISCORD_TOKEN);

console.log(serializedCommands);

(async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId),
      {
        body: commands.map((command) => command.data.toJSON()),
      }
    );

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
