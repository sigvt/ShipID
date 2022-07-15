import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Honeybee } from "../honeybee";

export interface CommandContext {
  hb: Honeybee;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: CommandInteraction, context: CommandContext) => any;
}

export interface RoleChangeset {
  roleId: string;
  valid: boolean;
  since?: string;
}

export interface JwtToken {
  discordId: string;
  iat: number;
}
