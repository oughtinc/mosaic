import * as React from "react";
import styled from "styled-components";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

interface NextWorkspaceBtnProps {
  bsStyle: string;
  experimentId: string;
  label: string;
  navHook?: () => void;
}

const NextWorkspaceBtn = ({
  bsStyle,
  experimentId,
  label,
  navHook,
}: NextWorkspaceBtnProps) => {
  return (
    <Link
      onClick={navHook}
      to={`/next?e=${experimentId}`}
      style={{ margin: "0 5px" }}
    >
      <Button bsSize="small" bsStyle={bsStyle}>
        {label} »
      </Button>
    </Link>
  );
};

const TakeBreakBtn = ({
  bsStyle,
  experimentId,
  label,
  navHook,
}: NextWorkspaceBtnProps) => {
  return (
    <Link
      onClick={navHook}
      to={`/break?e=${experimentId}`}
      style={{ margin: "0 5px" }}
    >
      <Button bsSize="small" bsStyle={bsStyle}>
        {label} »
      </Button>
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
  experimentId: string;
  hasSubquestions: boolean;
  hasTimeBudget: boolean;
  hasTimerEnded: boolean;
  isActive: boolean;
  isInOracleMode: boolean;
  isTakingABreak?: boolean;
  isUserOracle: boolean;
  isUserMaliciousOracle: boolean;
  isAwaitingHonestExpertDecision: boolean;
  snapshot(action: string): void;
  markAsNotStaleRelativeToUser(): void;
  concedeToMalicious(): void;
  markAsNotStale(): void;
  playOutSubtree(): void;
}

// Note that there in the normal functioning of the app,
// transferRemainingBudgetToParent and markAsNotStaleRelativeToUser will not be undefined
// wherever they are called. Nevertheless, guards are included below because
// it's possible for this situation to arise given abnormal functioning of the
// app.
class EpisodeNavPresentational extends React.Component<EpisodeNavProps, any> {
  public render() {
    const {
      experimentId,
      hasTimeBudget,
      hasTimerEnded,
      isActive,
      isInOracleMode,
      isTakingABreak,
      isUserOracle,
      isUserMaliciousOracle,
      markAsNotStaleRelativeToUser,
      snapshot,
      isAwaitingHonestExpertDecision,
      concedeToMalicious,
      playOutSubtree,
      markAsNotStale,
    } = this.props;

    if (isUserOracle && isInOracleMode) {
      return (
        <EpisodeNavContainer
          style={{
            backgroundColor: isUserMaliciousOracle ? "#ffcccc" : "#ccffcc",
          }}
        >
          {isTakingABreak ? (
            <NextWorkspaceBtn
              bsStyle="default"
              experimentId={experimentId}
              label={"Start on next workspace (Oracle Mode)"}
            />
          ) : (
            <div
              style={{
                color: isUserMaliciousOracle ? "#a66" : "#6a6",
                fontSize: "24px",
                fontVariant: "small-caps",
              }}
            >
              {isUserMaliciousOracle ? "malicious" : "honest"} expert mode
              {isAwaitingHonestExpertDecision && (
                <div>
                  <TakeBreakBtn
                    bsStyle="primary"
                    experimentId={experimentId}
                    label="Concede to malicious expert"
                    navHook={() => {
                      snapshot("CONCEDE_TO_MALICIOUS");
                      if (concedeToMalicious) {
                        markAsNotStale();
                        concedeToMalicious();
                      }
                    }}
                  />
                  <TakeBreakBtn
                    bsStyle="primary"
                    experimentId={experimentId}
                    label="Play out subtree"
                    navHook={() => {
                      snapshot("PLAY_OUT_SUBTREE");
                      if (markAsNotStaleRelativeToUser) {
                        playOutSubtree();
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </EpisodeNavContainer>
      );
    }

    return (
      <EpisodeNavContainer>
        {isActive ? (
          hasTimeBudget && hasTimerEnded ? (
            <NextWorkspaceBtn
              bsStyle="primary"
              experimentId={experimentId}
              label="Get next workspace"
            />
          ) : (
            <div>
              <TakeBreakBtn
                bsStyle="primary"
                experimentId={experimentId}
                label="Skip Workspace"
                navHook={() => {
                  snapshot("SKIP_WORKSPACE");
                  if (markAsNotStaleRelativeToUser) {
                    markAsNotStaleRelativeToUser();
                  }
                }}
              />
            </div>
          )
        ) : (
          <NextWorkspaceBtn
            bsStyle="primary"
            experimentId={experimentId}
            label={isTakingABreak ? "Start on next workspace" : "Get started"}
          />
        )}
      </EpisodeNavContainer>
    );
  }
}

const EpisodeNav: any = EpisodeNavPresentational;

export { EpisodeNav };
