import { User } from "discord.js";
import jwt from "jsonwebtoken";
import { HOST, JWT_SECRET } from "../../constants";
import { log } from "../../util";
import { JwtToken } from "../interfaces";

export function onboardingPhase(user: User) {
  log("onboardingPhase");
  const payload: JwtToken = {
    discordId: user.id,
    iat: Date.now(),
  };
  const state = jwt.sign(payload, JWT_SECRET);

  return user.send({
    content: `To verify your membership,
1. Connect your YouTube account with your Discord account
2. Click on the URL below to authenticate with ShipID
${HOST}/discord/authorize?state=${state}`,
  });
}
