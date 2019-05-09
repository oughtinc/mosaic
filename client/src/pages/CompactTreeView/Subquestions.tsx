import * as _ from "lodash";
import * as React from "react";

import { CompactTreeGroupContainer as V1CompactTreeGroupContainer } from "./V1CompactTreeGroupContainer";
import { CompactTreeGroupContainer as V2CompactTreeGroupContainer } from "./V2CompactTreeGroupContainer";

import { getVersionOfTree } from "./helpers/getVersionOfTree";

export class Subquestions extends React.PureComponent<any, any> {
  public render() {
    const { availablePointers, subquestions } = this.props;
    return (
      <div style={{ paddingLeft: "10px" }}>
        {_.sortBy(subquestions, w => Date.parse(w.createdAt)).map(w => {
          const treeVersion = getVersionOfTree(w);
          if (treeVersion === "V1") {
            return (
              <div key={w.id} style={{ marginBottom: "10px" }}>
                <V1CompactTreeGroupContainer
                  availablePointers={availablePointers}
                  workspaceId={w.id}
                />
              </div>
            );
          }
          return (
            <div key={w.id} style={{ marginBottom: "10px" }}>
              <V2CompactTreeGroupContainer
                availablePointers={availablePointers}
                workspaceId={w.id}
              />
            </div>
          );
        })}
      </div>
    );
  }
}
