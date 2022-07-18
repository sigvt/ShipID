import schedule from "node-schedule";
import { log } from "../util";

export function startScheduler() {
  log("scheduler", "ready");
  const scheduler = schedule.scheduleJob(`*/1 * * * *`, reverification);
}

function reverification(invokedAt: Date) {
  log("scheduler", "reverification begins at", invokedAt);

  // look for certificates for which the last verified date is older than a certain time period
}
