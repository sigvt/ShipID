import jwt from "jsonwebtoken";
import { HOST, JWT_SECRET } from "../../../constants";
import { JwtToken } from "../../../auth";
import { Message } from "discord.js";

export function onboardingPhase(message: Message) {
  const payload: JwtToken = {
    discordId: message.author.id,
    iat: Date.now(),
  };
  const state = jwt.sign(payload, JWT_SECRET);
  message.reply(`${HOST}/auth?state=${state}`);
}
