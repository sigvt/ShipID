import { Message, User } from "discord.js";
import jwt from "jsonwebtoken";
import { JwtToken } from "../../../auth";
import { HOST, JWT_SECRET } from "../../../constants";
import { log } from "../../../util";

export function onboardingPhase(user: User) {
  log("onboardingPhase");
  const payload: JwtToken = {
    discordId: user.id,
    iat: Date.now(),
  };
  const state = jwt.sign(payload, JWT_SECRET);

  user.send([
    "To verify your membership, proceed to sign-in with your YouTube account.",
    `${HOST}/auth?state=${state}`,
  ]);
}
