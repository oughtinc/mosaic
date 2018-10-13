import * as React from "react";
import { graphql } from "react-apollo";

import { AvailableBudget } from "./AvailableBudget";
import { Timer } from "./Timer";

import { UPDATE_ALLOCATED_BUDGET } from "../../../graphqlQueries";

class TimerAndTimeBudgetInfoPresentational extends React.Component<any,  any> {
  public constructor(props: any) {
    super(props);
    this.state = {
      displayedAllocatedBudget: props.initialAllocatedBudget,
      remainingDurationInMs: props.durationInMs,
    };
  }

  public render() {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        {
          this.props.hasTimer
          &&
          <Timer
            totalDurationInMs={this.props.durationInMs}
            remainingDurationInMs={this.state.remainingDurationInMs}
            onTimerEnd={this.props.handleTimerEnd}
            onTimerTick={this.handleTimerTick}
            style={{ marginRight: "30px" }}
            tickDuration={this.props.tickDuration}
            workspaceId={this.props.workspaceId}
          />
        }
        <AvailableBudget
          allocatedBudget={this.state.displayedAllocatedBudget}
          style={{ marginRight: "30px" }}
          totalBudget={this.props.totalBudget}
        />
      </div>
    );
  }

  private handleTimerTick = () => {
    this.props.updateAllocatedBudget({
      variables: {
        changeToBudget: this.props.tickDuration,
        workspaceId: this.props.workspaceId,
      }
    });

    this.setState({
      displayedAllocatedBudget: Math.min(
        this.props.totalBudget,
        Number(this.state.displayedAllocatedBudget) + Number(this.props.tickDuration)
      ),
      remainingDurationInMs: Math.max(
        0,
        this.state.remainingDurationInMs - (this.props.tickDuration * 1000)
      ),
    }, () => {
      if (this.state.remainingDurationInMs === 0) {
        this.props.handleTimerEnd();
      }
    });
  }
}

export const TimerAndTimeBudgetInfo: any = graphql(
  UPDATE_ALLOCATED_BUDGET,
  {
    name: "updateAllocatedBudget",
    options: {
      refetchQueries: ["workspace"]
    }
  })(TimerAndTimeBudgetInfoPresentational);
