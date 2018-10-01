import * as React from "react";
import { BlockEditor } from "../../components/BlockEditor";
import { databaseJSONToValue } from "../../lib/slateParser";

const RootBlock = ({ availablePointers = [], block }) => {
  if (block && block.value) {
    return (
      <div style={{ display: "inline-block" }}>
        <BlockEditor
          availablePointers={availablePointers}
          blockId={block.id}
          initialValue={databaseJSONToValue(block.value)}
          name={block.id}
          readOnly={true}
          shouldAutosave={false}
        />
      </div>
    );
  } else {
    return null;
  }
};

export { RootBlock };
