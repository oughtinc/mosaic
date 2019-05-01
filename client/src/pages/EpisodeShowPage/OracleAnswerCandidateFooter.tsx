import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

import { listOfSlateNodesToText } from "../../lib/slateParser";
import {
  responseFooterBgColor,
  responseFooterBorderTopColor,
} from "../../styles";

const TakeBreakBtn = ({
  bsStyle,
  disabled,
  experimentId,
  label,
  navHook,
}: any) => {
  if (!experimentId) {
    return (
      <Button
        bsSize="small"
        bsStyle={bsStyle || "primary"}
        disabled={disabled}
        onClick={navHook}
        style={{ margin: "0 5px" }}
      >
        {label} »
      </Button>
    );
  }

  return (
    <Link
      onClick={navHook}
      to={`/break?experiment=${experimentId}`}
      style={{ margin: "0 5px" }}
    >
      <Button bsSize="small" bsStyle={bsStyle || "primary"} disabled={disabled}>
        {label} »
      </Button>
    </Link>
  );
};

class OracleAnswerCandidateFooterPresentational extends React.Component<
  any,
  any
> {
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
      responseIsEmpty,
    } = this.props;

    console.log("responseIsEmpty", responseIsEmpty);

    return (
      <div
        style={{
          backgroundColor: responseFooterBgColor,
          borderRadius: "0 0 3px 3px",
          borderTop: `1px solid ${responseFooterBorderTopColor}`,
          padding: "10px",
        }}
      >
        <TakeBreakBtn
          experimentId={experimentId}
          label={`Submit!`}
          disabled={responseIsEmpty}
          navHook={() => {
            markAsNotStale();
            markAsCurrentlyResolved();
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  console.log(props);
  const responseBlock = state.blocks.blocks.find(
    block => block.id === props.blockId,
  );
  if (!responseBlock) {
    return { responseIsEmpty: false };
  }
  return {
    responseIsEmpty:
      listOfSlateNodesToText(
        responseBlock.value.toJS().document.nodes,
        false,
      ) === "",
  };
};

const OracleAnswerCandidateFooter: any = connect(mapStateToProps)(
  OracleAnswerCandidateFooterPresentational,
);

export { OracleAnswerCandidateFooter };
