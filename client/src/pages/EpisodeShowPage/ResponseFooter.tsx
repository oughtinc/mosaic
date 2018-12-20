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
      isInOracleMode,
      isUserOracle,
      markAsAnsweredByOracle,
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
          !(isUserOracle && isInOracleMode)
          &&
          hasParent
          ?
            <TakeBreakBtn
              label={`Done!${this.props.hasTimeBudget ? " (returns budget)" : ""}`}
              navHook={() => {
                transferRemainingBudgetToParent();
                markAsNotStale();
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
                  markAsNotEligible();
                }}
              />
              :
              <TakeBreakBtn
                bsStyle="danger"
                label={`Done!${this.props.hasTimeBudget ? " (take budget)" : ""}`}
                navHook={() => {
                  depleteBudget();
                  markAsAnsweredByOracle();
                  markAsNotEligibleForOracle();
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
