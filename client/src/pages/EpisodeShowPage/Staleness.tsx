import * as React from "react";
import { Button } from "react-bootstrap";

interface Props {
  workspaceId: string;
  isStale: boolean;
  updateStaleness: any;
}

export const Staleness = (props: Props) => {
  const isStale = props.isStale;
  return (
    <div>
      <div>Stale: {isStale ? "yes" : "no"}</div>
      <Button
        bsStyle="default"
        bsSize="xsmall"
        onClick={() => props.updateStaleness(!isStale)}
      >
        Mark {isStale ? "fresh" : "stale"}
      </Button>
    </div>
  );
};
