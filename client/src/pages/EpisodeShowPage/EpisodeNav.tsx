import * as React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import { Auth } from "../../auth";

interface NextWorkspaceBtnProps {
  bsStyle: string;
  label: string;
  navHook?: () => void;
}

const NextWorkspaceBtn = ({ bsStyle, label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to="/next" style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle={bsStyle}>{label} »</Button>
    </Link>
  );
};

const TakeBreakBtn = ({ bsStyle, label, navHook }: NextWorkspaceBtnProps) => {
  return (
    <Link onClick={navHook} to="/break" style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle={bsStyle}>{label} »</Button>
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
  hasSubquestions: boolean;
  hasTimeBudget: boolean;
  hasTimerEnded: boolean;
  isActive: boolean;
  isInOracleMode: boolean;
  isTakingABreak?: boolean;
  markAsNotStaleRelativeToUser(): void;
  updateIsEligibleForOracle(isEligibleForOracle: boolean): void;
}

// Note that there in the normal functioning of the app,
// transferRemainingBudgetToParent and markAsNotStaleRelativeToUser will not be undefined
// wherever they are called. Nevertheless, guards are included below because
// it's possible for this situation to arise given abnormal functioning of the
// app.
class EpisodeNavPresentational extends React.Component<EpisodeNavProps, any> {
  public render() {
    const {
      hasTimeBudget,
      hasTimerEnded,
      isActive,
      isInOracleMode,
      isTakingABreak,
      markAsNotStaleRelativeToUser,
      updateIsEligibleForOracle,
    } = this.props;

    if (Auth.isOracle() && isInOracleMode) {
      return (
        <EpisodeNavContainer style={{ backgroundColor: "#ffe8e8" }}>
          {
            isTakingABreak
            ?
              <NextWorkspaceBtn
                bsStyle="default"
                label={"Start on next workspace (Oracle Mode)"}
              />
            :
              (
                <div>
                  <TakeBreakBtn
                    bsStyle="default"
                    label="Skip and go to next workspace"
                  />
                  {
                    !this.props.hasSubquestions
                    &&
                    <TakeBreakBtn
                      bsStyle="default"
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
          isActive
          ?
          (
            hasTimeBudget && hasTimerEnded
            ?
              <NextWorkspaceBtn
                bsStyle="primary"
                label="Get next workspace"
              />
            :
              <div>
                <TakeBreakBtn
                  bsStyle="primary"
                  label="Needs more work"
                  navHook={() => markAsNotStaleRelativeToUser && markAsNotStaleRelativeToUser()}
                />
              </div>
          )
          :
          <NextWorkspaceBtn
            bsStyle="primary"
            label={isTakingABreak ? "Start on next workspace" : "Get started"}
          />
        }
      </EpisodeNavContainer>
    );
  }
}

const EpisodeNav: any = EpisodeNavPresentational;

export { EpisodeNav };
