import { Duration } from "luxon";

function convertMsToReadableDurationInfo(milliseconds) {
  const durationInMs = Duration.fromMillis(milliseconds);
  const duration = durationInMs.shiftTo("days", "hours", "minutes", "seconds");

  const isADayOrMore = duration.days > 0;
  const isAnHourOrMore = duration.hours > 0;
  const isAMinuteOrMore = duration.minutes > 0;
  const isASecondOrMore = duration.seconds > 0;
  const isExactlySixtySeconds =
    duration.minutes === 1 && duration.seconds === 0;

  const daysToDisplay = isADayOrMore
    ? Duration.fromObject({ days: duration.days }).toFormat("d")
    : undefined;

  const hoursToDisplay = isAnHourOrMore
    ? Duration.fromObject({ hours: duration.hours }).toFormat("h")
    : undefined;

  const minutesToDisplay =
    isAMinuteOrMore && !isExactlySixtySeconds
      ? Duration.fromObject({ minutes: duration.minutes }).toFormat("m")
      : undefined;

  const secondsToDisplay =
    isASecondOrMore || durationInMs < 1000
      ? isExactlySixtySeconds
        ? 60
        : Duration.fromObject({ seconds: duration.seconds }).toFormat("s")
      : undefined;

  return {
    daysToDisplay,
    hoursToDisplay,
    minutesToDisplay,
    secondsToDisplay
  };
}

export { convertMsToReadableDurationInfo };
