import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import {
  responseFooterBgColor,
  responseFooterBorderTopColor,
} from "../../styles";

const TakeBreakBtn = ({ experimentId, label, navHook }: any) => {
  return (
    <Link onClick={navHook} to={`/break?experiment=${experimentId}`} style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle="primary">{label} »</Button>
    </Link>
  );
};

class ResponseFooterPresentational extends React.Component<any, any> {
  public render() {
    const {
      depleteBudget,
      experimentId,
      hasParent,
      hasTimeBudget,
      isInOracleMode,
      isUserOracle,
      markAsAnsweredByOracle,
      markAsCurrentlyResolved,
      markAsNotEligibleForOracle,
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
              <TakeBreakBtn
                experimentId={experimentId}
                bsStyle="danger"
                label={`Done!${hasTimeBudget ? " (take budget)" : ""}`}
                navHook={() => {
                  if (hasTimeBudget) {
                    depleteBudget();
                  }
                  markAsAnsweredByOracle();
                  markAsNotEligibleForOracle();
                  markAsCurrentlyResolved();
                }}
              />
            )
        }
      </div>
    );
  }
}

const ResponseFooter: any = ResponseFooterPresentational;

export { ResponseFooter };
