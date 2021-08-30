import { mongoose } from "@typegoose/typegoose";
import express from "express";
import http from "http";
import {
  DISCORD_TOKEN,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  HOST,
  isDev,
  MONGODB_URL,
  PORT,
  PREFIX,
} from "./constants";
import { createBot } from "./modules/discord";
import { createYouTubeHandler } from "./modules/youtube";

mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bot = createBot();

const youtubeHandler = createYouTubeHandler({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUris: [`${HOST}/callback`],
  scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
});

const app = express();
app.use(youtubeHandler);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Listening ${PREFIX} at ${HOST} (${isDev ? "dev" : "prod"})`);
  bot.login(DISCORD_TOKEN);
});
