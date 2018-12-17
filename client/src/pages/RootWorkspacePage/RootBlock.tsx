import * as _ from "lodash";
import * as React from "react";
import { listOfSlateNodesToText } from "../../lib/slateParser";

const RootBlock = ({ availablePointers = [], block, defaultText = ""}) => {
  let displayText = defaultText;
  if (block && block.value) {
    const blockText = listOfSlateNodesToText(block.value, availablePointers);
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
          minWidth: 0
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
