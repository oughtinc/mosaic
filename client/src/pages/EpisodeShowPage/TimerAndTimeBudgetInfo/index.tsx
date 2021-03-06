import * as React from "react";
import { graphql } from "react-apollo";

import { AvailableBudget } from "./AvailableBudget";
import { WorkspaceTimer } from "../WorkspaceTimer";

import { UPDATE_TIME_SPENT_ON_WORKSPACE } from "../../../graphqlQueries";

class TimerAndTimeBudgetInfoPresentational extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
    this.state = {
      displayedAllocatedBudget: props.initialAllocatedBudget,
      remainingDurationInMs: props.durationInMs,
    };
  }

  public componentDidUpdate(prevProps: any) {
    // we usually ignore graphql changes in allocatedBudget, because are
    // usually timer ticks, and for synchronization purposes we want exact
    // control over the timer ticks, we don't want to be reliant on server
    // perf issues for this

    // an upshot of ignoring graphql updates to allocatedBudget is that we miss
    // the updates to allocatedBudget that occur after the creation of a child
    // easiest fix here is to just assume any change <0||>5 is a child creation
    // and listen to any graphql update to allocaedBudget above this threshold
    const initialAllocatedBudgetChange =
      prevProps.initialAllocatedBudget - this.props.initialAllocatedBudget;

    if (initialAllocatedBudgetChange < 0 || initialAllocatedBudgetChange > 5) {
      this.setState({
        displayedAllocatedBudget: this.props.initialAllocatedBudget,
      });
    }
  }

  public render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {this.props.isActive && (
          <WorkspaceTimer
            totalDurationInMs={this.props.durationInMs}
            remainingDurationInMs={this.state.remainingDurationInMs}
            onTimerEnd={this.props.handleTimerEnd}
            onTimerTick={this.handleTimerTick}
            style={{ marginRight: "30px" }}
            tickDuration={this.props.tickDuration}
            workspaceId={this.props.workspaceId}
          />
        )}
        <AvailableBudget
          allocatedBudget={this.state.displayedAllocatedBudget}
          style={{ marginRight: "30px" }}
          totalBudget={this.props.totalBudget}
        />
      </div>
    );
  }

  private handleTimerTick = () => {
    this.props.updateTimeSpentOnWorkspace({
      variables: {
        secondsSpent: this.props.tickDuration,
        doesAffectAllocatedBudget: true,
        workspaceId: this.props.workspaceId,
      },
    });

    this.setState(
      {
        displayedAllocatedBudget: Math.min(
          this.props.totalBudget,
          Number(this.state.displayedAllocatedBudget) +
            Number(this.props.tickDuration),
        ),
        remainingDurationInMs: Math.max(
          0,
          this.state.remainingDurationInMs - this.props.tickDuration * 1000,
        ),
      },
      () => {
        if (this.state.remainingDurationInMs === 0) {
          this.props.handleTimerEnd();
        }
      },
    );
  };
}

export const TimerAndTimeBudgetInfo: any = graphql(
  UPDATE_TIME_SPENT_ON_WORKSPACE,
  {
    name: "updateTimeSpentOnWorkspace",
    options: {
      refetchQueries: ["workspace"],
    },
  },
)(TimerAndTimeBudgetInfoPresentational);
