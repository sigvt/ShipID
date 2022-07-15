import schedule from "node-schedule";

export function startScheduler() {
  console.log("scheduler started");
  const scheduler = schedule.scheduleJob(`*/1 * * * *`, reverification);
}

function reverification(invokedAt: Date) {
  console.log("reverification begins at", invokedAt);

  // look for certificates for which the last verified date is older than a certain time period

  //
}
