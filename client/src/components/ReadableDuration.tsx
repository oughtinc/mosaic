import { Duration } from "luxon";
import * as React from "react";

class ReadableDuration extends React.Component<any,  any> {
  public render() {
    const durationInMs = Duration.fromMillis(this.props.durationInMs);
    const duration = durationInMs.shiftTo("days", "hours", "minutes", "seconds");

    const isADayOrMore = duration.days > 0;
    const isAnHourOrMore = duration.hours > 0;
    const isAMinuteOrMore = duration.minutes > 0;
    const isASecondOrMore = duration.seconds > 0;
    const isExactlySixtySeconds = (durationInMs / 1000 === 60);
    const isSixtySecondsOrLess = (durationInMs / 1000 <= 60);

    const numberFontSize = this.props.numberFontSize || "28px";

    if (this.props.durationInMs < 0) {
      return (
        <span>
          <span style={{ fontSize: numberFontSize }}>0</span>s
        </span>
      );
    }

    return (
      <span style={this.props.style}>
        {
          isADayOrMore
          &&
          <span>
            <span
              style={{
                fontSize: numberFontSize,
              }}
            >
              {Duration.fromObject({ days: duration.days }).toFormat("d")}
            </span>
            d
            {" "}
          </span>
        }
        {
          isAnHourOrMore
          &&
          <span>
            <span
              style={{
                fontSize: numberFontSize,
              }}
            >
              {Duration.fromObject({ hours: duration.hours }).toFormat("h")}
            </span>
            h
            {" "}
          </span>
        }
        {
          (isAMinuteOrMore && !isExactlySixtySeconds)
          &&
          <span>
            <span
              style={{
                fontSize: numberFontSize,
              }}
            >
              {Duration.fromObject({ minutes: duration.minutes }).toFormat("m")}
            </span>
            m
            {" "}
          </span>
        }
        {
          (
            (this.props.shouldShowSeconds && isASecondOrMore)
            ||
            isSixtySecondsOrLess
          )
          &&
          <span>
            <span
              style={{
                fontSize: numberFontSize,
              }}
            >
              {
                isExactlySixtySeconds
                ?
                Duration.fromObject({ seconds: 60 }).toFormat("s")
                :
                Duration.fromObject({ seconds: duration.seconds }).toFormat("s")
              }
            </span>
            s
          </span>
        }
      </span>
    );
  }
}

export { ReadableDuration };
