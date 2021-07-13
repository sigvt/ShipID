import Discord from "discord.js";
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
  command: string;
  handler: Handler;
}

export interface RoleChangeset {
  roleId: string;
  eligible: boolean;
}
