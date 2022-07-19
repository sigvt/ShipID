import express from "express";
import http from "http";
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_TOKEN,
  HOST,
  isDev,
  PORT,
} from "./constants";
import { createAuthHandler } from "./server/auth";
import { createBot } from "./discord/bot";
import { startScheduler } from "./scheduler";
import { log } from "./util";

// setup discord bot
const bot = createBot();

const discordOAuthHandler = createAuthHandler({
  clientId: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  redirectUri: `${HOST}/discord/callback`,
});

const app = express();

app.use(discordOAuthHandler);

const server = http.createServer(app);

// start auth server
server.listen(PORT, () => {
  log("http", `ready -> ${HOST} (${isDev ? "dev" : "prod"})`);

  // start scheduler
  startScheduler();

  // start bot
  bot.login(DISCORD_TOKEN);
});
