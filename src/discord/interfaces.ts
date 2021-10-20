import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { Status } from "../models/verification";
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
  status: Status;
}

export interface JwtToken {
  discordId: string;
  iat: number;
}
