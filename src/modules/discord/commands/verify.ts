import { getUserByDiscordId } from "../../../db";
import { HandlerOptions } from "../interfaces";
import { applyRolesPhase } from "../phases/applyRolesPhase";
import { onboardingPhase } from "../phases/onboardingPhase";
import { verificationPhase } from "../phases/verificationPhase";

export const verify = {
  // !sid verify
  command: "verify",
  handler: async ({ message, hb }: HandlerOptions) => {
    console.log("verify", message.author.username);

    const maybeUser = await getUserByDiscordId(message.author.id);
    console.log("maybeUser", maybeUser);
    if (!maybeUser) {
      // new user
      return onboardingPhase(message);
    }

    const isDM = message.guild == null;
    if (isDM) {
      message.reply(
        "User YouTube account has been successfully verified. Type `!sid verify` again on the server where you want member-specific roles."
      );
      return;
    }

    // returning user
    const roleChangesets = await verificationPhase(message, maybeUser, hb);
    if (!roleChangesets) {
      console.log("!roleChangesets");
      return;
    }

    const result = [];
    result.push(`here's the verification result`);
    for (const cs of roleChangesets) {
      const role = (await message.guild!.roles.fetch(cs.roleId))!;
      result.push(`${role.name}: ${cs.eligible ? "Eligible" : "Non-eligible"}`);
    }
    result.push(`thank you for using ShipID`);

    console.log("roleChangesets", roleChangesets);

    await applyRolesPhase(message, roleChangesets);

    await message.reply(result);
  },
};
