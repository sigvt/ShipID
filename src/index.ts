import { mongoose } from "@typegoose/typegoose";
import express from "express";
import http from "http";
import {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_TOKEN,
  HOST,
  isDev,
  MONGODB_URL,
  PORT,
} from "./constants";
import { createBot } from "./discord/bot";
import { createAuthHandler } from "./discord/auth";
import { startScheduler } from "./scheduler";

// setup db
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

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

// start server
server.listen(PORT, () => {
  console.log(`Listening at ${HOST} (${isDev ? "dev" : "prod"})`);

  // start scheduler
  startScheduler();

  // start bot
  bot.login(DISCORD_TOKEN);
});
