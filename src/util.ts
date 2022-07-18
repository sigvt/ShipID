import chalk from "chalk";
import debug from "debug";

export const debugLog = debug("shipid");

export function log(topic: string, ...obj: any[]) {
  console.log(chalk.green(`[${topic}]`, ...obj));
}

export function errorLog(topic: string, ...obj: any[]) {
  console.log(chalk.red(`[${topic}]`, ...obj));
}
