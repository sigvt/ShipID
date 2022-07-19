import { ChatInputCommandInteraction } from "discord.js";
import jwt from "jsonwebtoken";
import { HOST, JWT_SECRET } from "../../constants";
import { debugLog } from "../../util";
import { State, StateContext } from "../commands/reverify";
import { JwtToken } from "../interfaces";

export async function onboardState(
  intr: ChatInputCommandInteraction,
  context: StateContext
): Promise<[State, StateContext]> {
  debugLog("onboardState");

  const user = intr.user;

  const payload: JwtToken = {
    discordId: user.id,
    iat: Date.now(),
  };
  const state = jwt.sign(payload, JWT_SECRET);

  await user.send({
    content: `To verify your membership,
1. Connect your YouTube account with your Discord account
Guide: https://www.followchain.org/link-youtube-to-discord
2. Connect your Discord account with ShipID using the URL below
${HOST}/discord/authorize?state=${state}`,
  });

  return [State.END, {}];
}
