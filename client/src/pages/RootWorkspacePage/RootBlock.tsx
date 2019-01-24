import * as _ from "lodash";
import * as React from "react";
import { listOfSlateNodesToText } from "../../lib/slateParser";

const RootBlock = (props: any) => {
  const { block, defaultText = "", style } = props;
  let displayText = defaultText;
  if (block && block.value) {

    let blockText;
    if (_.isArray(block.value)) {
      blockText = listOfSlateNodesToText(block.value);
    } else {
      blockText = listOfSlateNodesToText([block.value]);
    }

    if (_.trim(blockText) !== "") {
      displayText = blockText;
    }
  }
  if (displayText !== "") {
    return (
      <div
        style={{
          display: "inline-block",
          maxWidth: "100%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          minWidth: 0,
          ...style,
        }}
      >
      {displayText}
      </div>
    );
  } else {
    return null;
  }
};

export { RootBlock };
