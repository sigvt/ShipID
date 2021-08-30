import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Status } from "../../models/verification";
import { Honeybee } from "../../modules/honeybee";

export interface CommandContext {
  hb: Honeybee;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (
    interaction: CommandInteraction,
    context: CommandContext
  ) => Promise<any>;
}

export interface RoleChangeset {
  roleId: string;
  status: Status;
}
