import * as React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { Auth } from "../../auth";

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
  hasSubquestions: boolean;
  hasTimer: boolean;
  hasTimerEnded: boolean;
  isInOracleMode: boolean;
  isTakingABreak?: boolean;
  depleteBudget(): void;
  transferRemainingBudgetToParent?(): void;
  updateStaleness?(isStale: boolean): void;
  updateIsEligibleForOracle(isStale: boolean): void;
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
      isInOracleMode,
      isTakingABreak,
      depleteBudget,
      transferRemainingBudgetToParent,
      updateStaleness,
      updateIsEligibleForOracle,
    } = this.props;

    if (Auth.isOracle() && isInOracleMode) {
      return (
        <EpisodeNavContainer style={{ backgroundColor: "#ffe8e8" }}>
          {
            isTakingABreak
            ?
              <NextWorkspaceBtn
                label={"Start on next workspace (Oracle Mode)"}
                navHook={() => {}}
              />
            :
              (
                <div>
                  <TakeBreakBtn
                    label="Skip and go to next workspace"
                    navHook={() => {

                    }}
                  />
                  {
                    !this.props.hasSubquestions
                    &&
                    <TakeBreakBtn
                      label="Done (leave budget)"
                      navHook={() => {
                        updateIsEligibleForOracle(false);
                      }}
                    />
                  }
                </div>
              )
          }
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

const EpisodeNav: any = EpisodeNavPresentational;

export { EpisodeNav };
