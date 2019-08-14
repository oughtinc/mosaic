import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const TakeBreakBtn = ({ bsStyle, experimentId, label, navHook }) => {
  return (
    <Link
      onClick={navHook}
      to={`/break?e=${experimentId}`}
      style={{ margin: "0 5px" }}
    >
      <Button bsSize="large" bsStyle={bsStyle}>
        {label} »
      </Button>
    </Link>
  );
};

export class HonestExpertDecisionBtns extends React.Component<any, any> {
  public render() {
    const {
      experimentId,
      snapshot,
      concedeToMalicious,
      playOutSubtree,
      markAsNotStale,
      isGreatGrandparentRootWorkspace,
    } = this.props;

    return (
      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}
      >
        {!isGreatGrandparentRootWorkspace && (
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
        )}
        <TakeBreakBtn
          bsStyle="primary"
          experimentId={experimentId}
          label={`Play out subtree${
            isGreatGrandparentRootWorkspace ? " (required)" : ""
          }`}
          navHook={() => {
            snapshot("PLAY_OUT_SUBTREE");
            playOutSubtree();
          }}
        />
      </div>
    );
  }
}
