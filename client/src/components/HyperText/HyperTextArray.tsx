import * as React from "react";

import HyperText from "./HyperText";

import { HyperTextArray as HyperTextArrayT } from "../../data/types";

interface HyperTextArrayProps {
  value: HyperTextArrayT;
}

const HyperTextArray: React.SFC<HyperTextArrayProps> = ({ value }) => {
  return (
    <span className="HyperText HyperText-Array">
      {value.map((x, i) => (
        <>
          <HyperText key={i} value={x} />{" "}
        </>
      ))}
    </span>
  );
};

export default HyperTextArray;
