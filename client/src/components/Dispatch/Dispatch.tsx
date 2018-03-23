import * as React from "react";

import HyperText from "../HyperText/HyperText";
import { Row, HyperTextRow } from "../../data/types";


interface DispatchProps {
  object: Row;
}

const Dispatch: React.SFC<DispatchProps> = ({ object }) => {
  if (object.type === "HyperText") {
    return <HyperText value={(object as HyperTextRow).value} />;
  } else {
    return (
      <div>
        <pre>{JSON.stringify(object.value, null, 2)}</pre>
      </div>
    );
  }
};

export default Dispatch;
