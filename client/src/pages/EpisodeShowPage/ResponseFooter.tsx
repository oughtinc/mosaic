import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import {
  responseFooterBgColor,
  responseFooterBorderTopColor,
} from "../../styles";

const TakeBreakBtn = ({ label, navHook }: any) => {
  return (
    <Link onClick={navHook} to="/break" style={{ margin: "0 5px" }}>
      <Button bsSize="small" bsStyle="primary">{label} »</Button>
    </Link>
  );
};

class ResponseFooterPresentational extends React.Component<any, any> {
  public render() {
    const {
      depleteBudget,
      hasParent,
      hasTimeBudget,
      isInOracleMode,
      isUserOracle,
      markAsAnsweredByOracle,
      markAsCurrentlyResolved,
      markAsNotEligible,
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
                label="Done!"
                navHook={() => {
                  markAsNotStale();
                  markAsCurrentlyResolved();
                  markAsNotEligible();
                }}
              />
              :
              <TakeBreakBtn
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
