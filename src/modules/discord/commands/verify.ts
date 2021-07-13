import { getUserByDiscordId } from "../../../db";
import { HandlerOptions } from "../interfaces";
import { applyRolesPhase } from "../phases/applyRolesPhase";
import { onboardingPhase } from "../phases/onboardingPhase";
import { verificationPhase } from "../phases/verificationPhase";

export const verify = {
  // !sid verify
  command: "verify",
  handler: async ({ message, hb }: HandlerOptions) => {
    const maybeUser = await getUserByDiscordId(message.author.id);
    if (!maybeUser) {
      // new user
      return onboardingPhase(message);
    }

    // returning user
    const roleChangesets = await verificationPhase(message, maybeUser, hb);
    if (!roleChangesets) return;

    await applyRolesPhase(message, roleChangesets);
  },
};
