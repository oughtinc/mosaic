import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import {
  responseFooterBgColor,
  responseFooterBorderTopColor,
} from "../../styles";

const TakeBreakBtn = ({ bsStyle, disabled, experimentId, label, navHook }: any) => {
  if (!experimentId) {
    return (
      <Button bsSize="small" bsStyle={bsStyle || "primary"} disabled={disabled} onClick={navHook} style={{ margin: "0 5px" }}>{label} »</Button>
    );
  }

  return (
    <Link onClick={navHook} to={`/break?experiment=${experimentId}`} style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle={bsStyle || "primary"} disabled={disabled}>{label} »</Button>
    </Link>
  );
};

class ResponseFooterPresentational extends React.Component<any, any> {
  public render() {
    const {
      declineToChallenge,
      experimentId,
      hasChildren,
      hasParent,
      hasTimeBudget,
      isInOracleMode,
      isRequestingLazyUnlock,
      isUserOracle,
      isUserMaliciousOracle,
      markAsCurrentlyResolved,
      markAsNotStale,
      transferRemainingBudgetToParent,
    } = this.props;

    return (
      <div
        style={{
          backgroundColor: responseFooterBgColor,
          borderRadius: "0 0 3px 3px",
          borderTop: `1px solid ${responseFooterBorderTopColor}`,
          padding: "10px",
        }}
      >
        {
          (
            !(isUserOracle && isInOracleMode)
            &&
            hasParent
          )
          ?
            <TakeBreakBtn
              experimentId={experimentId}
              label={`Done!${hasTimeBudget ? " (returns budget)" : ""}`}
              navHook={() => {
                // TODO: address potential race condition here with modifying
                // budget and modifying staleness
                if (hasTimeBudget) {
                  transferRemainingBudgetToParent();
                }
                markAsNotStale();
                markAsCurrentlyResolved();
              }}
            />
          :
            (
              !(isUserOracle && isInOracleMode)
              ?
              <TakeBreakBtn
                experimentId={experimentId}
                label="Done!"
                navHook={() => {
                  markAsNotStale();
                  markAsCurrentlyResolved();
                }}
              />
              :
              <div>
                <TakeBreakBtn
                  disabled={!isRequestingLazyUnlock && !hasChildren}
                  experimentId={experimentId}
                  bsStyle="primary"
                  label={(isUserMaliciousOracle && !isRequestingLazyUnlock && hasParent) ? "Challenge!" : "Done!"}
                  navHook={() => {
                    markAsNotStale();
                    if (isRequestingLazyUnlock) {
                      markAsCurrentlyResolved();
                    }
                  }}
                />
                {
                  isUserMaliciousOracle
                  &&
                  !isRequestingLazyUnlock
                  &&
                  hasParent
                  &&
                  <TakeBreakBtn
                    experimentId={experimentId}
                    bsStyle="danger"
                    label={`Decline to Challenge!`}
                    navHook={() => {
                      markAsNotStale();
                      declineToChallenge();
                    }}
                  />
                }
              </div>
            )
        }
      </div>
    );
  }
}

const ResponseFooter: any = ResponseFooterPresentational;

export { ResponseFooter };
