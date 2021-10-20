import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { DISCORD_TOKEN } from "../../constants";
import { commands } from "./commands";

const clientId = process.env.DISCORD_CLIENT_ID!;
const guildId = process.env.DISCORD_GUILD_ID!;
const token = DISCORD_TOKEN;

const serializedCommands = commands.map((command) => command.data.toJSON());

const rest = new REST({ version: "9" }).setToken(token);

console.log(serializedCommands);

(async () => {
  try {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands.map((command) => command.data.toJSON()),
    });

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
})();
