import * as React from "react";
import { graphql } from "react-apollo";

import { Timer } from "../../components/Timer";

import { UPDATE_TIME_SPENT_ON_WORKSPACE } from "../../graphqlQueries";

export class TimerWhenNoTimeBudgetPresentational extends React.Component<any,  any> {
  public render() {
    if (!this.props.hasTimer) {
      return null;
    }
    return (
      <Timer
        {...this.props}
        onTimerTick={this.handleTimerTick}
        hasNoDisplayedComponent={true}
      />
    );
  }

  private handleTimerTick = () => {
    this.props.updateTimeSpentOnWorkspace({
      variables: {
        doesAffectAllocatedBudget: false,
        secondsSpent: this.props.tickDuration,
        workspaceId: this.props.workspaceId,
      }
    });
  }
}

export const TimerWhenNoTimeBudget: any = graphql(
  UPDATE_TIME_SPENT_ON_WORKSPACE,
  {
    name: "updateTimeSpentOnWorkspace",
  }
)(TimerWhenNoTimeBudgetPresentational);
