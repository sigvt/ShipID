import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { Honeybee } from "../honeybee";

export interface CommandContext {
  hb: Honeybee;
}

export interface Command {
  data:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (
    interaction: ChatInputCommandInteraction,
    context: CommandContext
  ) => any;
}

export interface RoleChangeset {
  roleId: string;
  valid: boolean;
  since: string | null;
}

export interface JwtToken {
  discordId: string;
  iat: number;
}
