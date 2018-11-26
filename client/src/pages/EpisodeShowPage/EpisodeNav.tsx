import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ORACLE_MODE_QUERY = gql`
  query oracleModeQuery {
    oracleMode
  }
`;

interface NextWorkspaceBtnProps {
  label: string;
  navHook?: () => void;
}

const NextWorkspaceBtn = ({ label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to="/next" style={{ margin: "0 5px" }}>
      <Button bsSize="small">{label} »</Button>
    </Link>
  );
};

const TakeBreakBtn = ({ label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to="/break" style={{ margin: "0 5px" }}>
      <Button bsSize="small">{label} »</Button>
    </Link>
  );
};

const EpisodeNavContainer = styled.div`
  padding: 10px;
  background-color: #b8ddfb;
  border-bottom: 1px solid #c8c8c8;
  text-align: center;
`;

interface EpisodeNavProps {
  hasParent: boolean;
  hasTimer: boolean;
  hasTimerEnded: boolean;
  isTakingABreak?: boolean;
  oracleModeQuery: any;
  depleteBudget?(): void;
  transferRemainingBudgetToParent?(): void;
  updateStaleness?(isStale: boolean): void;
  updateIsEligibleForOracle?(isStale: boolean): void;
}

// Note that there in the normal functioning of the app,
// transferRemainingBudgetToParent and updateStaleness will not be undefined
// wherever they are called. Nevertheless, guards are included below because
// it's possible for this situation to arise given abnormal functioning of the
// app.
class EpisodeNavPresentational extends React.Component<EpisodeNavProps, any> {
  public render() {
    const {
      hasParent,
      hasTimer,
      hasTimerEnded,
      isTakingABreak,
      depleteBudget,
      transferRemainingBudgetToParent,
      updateStaleness,
      updateIsEligibleForOracle,
    } = this.props;

    console.log("episode nav props", this.props.oracleModeQuery, this.props.oracleModeQuery.oracleMode);

    if (this.props.oracleModeQuery.oracleMode) {
      return (
        <EpisodeNavContainer style={{ backgroundColor: "#ffe8e8" }}>
          <NextWorkspaceBtn
            label="Done (leave budget)"
            navHook={() => {
              updateIsEligibleForOracle && updateIsEligibleForOracle(false);
            }}
          />
          <NextWorkspaceBtn
            label="Done (take budget)"
            navHook={() => {
              depleteBudget && depleteBudget();
              updateIsEligibleForOracle && updateIsEligibleForOracle(false);
            }}
          />
        </EpisodeNavContainer>
      );
    }

    return (
      <EpisodeNavContainer>
        {
          hasTimer
          ?
          (
            hasTimerEnded
            ?
              <NextWorkspaceBtn
                label="Get next workspace"
              />
            :
              <div>
                <TakeBreakBtn
                  label="Needs more work"
                  navHook={() => updateStaleness && updateStaleness(true)}
                />
                <TakeBreakBtn
                  label="Done for now"
                  navHook={() => updateStaleness && updateStaleness(false)}
                />
                {
                  hasParent
                  &&
                  <TakeBreakBtn
                    label="Done, and return budget"
                    navHook={() => {
                      if (transferRemainingBudgetToParent) {
                        transferRemainingBudgetToParent();
                      }

                      if (updateStaleness) {
                        updateStaleness(false);
                      }
                    }}
                  />
                }
              </div>
          )
          :
          <NextWorkspaceBtn
            label={isTakingABreak ? "Start on next workspace" : "Get started"}
            navHook={() => updateStaleness && updateStaleness(true)}
          />
        }
      </EpisodeNavContainer>
    );
  }
}

const EpisodeNav: any = compose(
  graphql(ORACLE_MODE_QUERY, {
    name: "oracleModeQuery",
  }),
)(EpisodeNavPresentational);

export { EpisodeNav };
