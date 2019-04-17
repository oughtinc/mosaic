import * as _ from "lodash";
import * as React from "react";

import { CompactTreeGroup } from "./CompactTreeGroup";

export class Subquestions extends React.PureComponent<any, any> {
  public render() {
    const {
      availablePointers,
      subquestions,
    } = this.props;

    return (
      <div style={{ paddingLeft: "10px" }}>
        {_.sortBy(subquestions, w => Date.parse(w.createdAt)).map(c =>
          <div key={c.id} style={{marginBottom: "10px"}}>
            <CompactTreeGroup
              availablePointers={availablePointers}
              workspaceId={c.id}
            />
          </div>
        )}
      </div>
    );
  }
}