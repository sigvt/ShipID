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

// start bot and server
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Listening at ${HOST} (${isDev ? "dev" : "prod"})`);
  bot.login(DISCORD_TOKEN);
});
