import schedule from "node-schedule";

// Check date when?
// End of the month (e.g. 7/31)
// Range?
// From the first to the current (e.g. 7/1 - 7/31)
//

export function startScheduler() {
  const scheduler = schedule.scheduleJob("*/10 * * * *", overallChecks);
  console.log(scheduler);
}

export function overallChecks() {}
