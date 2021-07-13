import { Command } from "../interfaces";
import { verify } from "./verify";
import { pairRole } from "./pairRole";

export const commands: Command[] = [verify, pairRole];
