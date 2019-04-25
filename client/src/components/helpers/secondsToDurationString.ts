import { Duration } from "luxon";

export function secondsToDurationString(
  seconds: number,
  shouldShowSeconds: boolean,
) {
  if (typeof seconds !== "number" || isNaN(seconds)) {
    return "N/A";
  }

  if (seconds < 0) {
    return "0s";
  }
  const milliseconds = seconds * 1000;
  const durationInMs = Duration.fromMillis(milliseconds);
  const duration = durationInMs.shiftTo("days", "hours", "minutes", "seconds");

  let durationString = "";

  if (duration.days > 0) {
    durationString += `${Duration.fromObject({ days: duration.days }).toFormat(
      "d",
    )}d`;
  }

  if (duration.hours > 0) {
    durationString += `${Duration.fromObject({
      hours: duration.hours,
    }).toFormat("h")}h`;
  }

  if (duration.minutes > 0) {
    durationString += `${Duration.fromObject({
      minutes: duration.minutes,
    }).toFormat("m")}m`;
  }

  if (
    (shouldShowSeconds || seconds < 10 * 60) &&
    (duration.seconds > 0 || seconds === 0)
  ) {
    durationString += `${Duration.fromObject({
      seconds: duration.seconds,
    }).toFormat("s")}s`;
  }

  return durationString;
}
