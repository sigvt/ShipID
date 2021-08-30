import { SlashCommandBuilder } from "@discordjs/builders";
import { SharedSlashCommandOptions } from "@discordjs/builders/dist/interactions/slashCommands/mixins/CommandOptions";
import { SharedNameAndDescription } from "@discordjs/builders/dist/interactions/slashCommands/mixins/NameAndDescription";
import Discord, { CommandInteraction } from "discord.js";
import { Status } from "../../models/verification";
import { Honeybee } from "../../modules/honeybee";

export interface HandlerOptions {
  message: Discord.Message;
  command: string;
  args: string[];
  hb: Honeybee;
}

export interface Handler {
  (options: HandlerOptions): Promise<any>;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: CommandInteraction, args?: string[]) => Promise<any>;
}

export interface RoleChangeset {
  roleId: string;
  status: Status;
}
