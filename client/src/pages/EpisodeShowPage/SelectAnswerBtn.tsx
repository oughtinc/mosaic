import * as React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const TakeBreakBtn = ({
  bsSize,
  bsStyle,
  disabled,
  experimentId,
  label,
  navHook,
}: any) => {
  if (!experimentId) {
    return (
      <Button
        bsSize={bsSize || "small"}
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
      <Button
        bsSize={bsSize || "small"}
        bsStyle={bsStyle || "primary"}
        disabled={disabled}
      >
        {label} »
      </Button>
    </Link>
  );
};

class SelectAnswerBtn extends React.Component<any, any> {
  public render() {
    const {
      children,
      experimentId,
      markAsCurrentlyResolved,
      markAsNotStale,
      selectAnswerCandidate,
    } = this.props;

    return (
      <TakeBreakBtn
        bsSize="large"
        experimentId={experimentId}
        label={children}
        navHook={async () => {
          await selectAnswerCandidate();
          markAsNotStale();
          markAsCurrentlyResolved();
        }}
      />
    );
  }
}

export { SelectAnswerBtn };
