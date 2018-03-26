// This is a top-level component. It will never be called recursively when we're rendering
// a hierarchy of nodes.

import * as React from "react";

import Store from "../../store";
import WorkspaceVersion from "../WorkspaceVersion/WorkspaceVersion";
import { WorkspaceValue, WorkspaceVersionRow } from "../../data/types";

interface WorkspaceProps {
  value: WorkspaceValue;
  store: Store;
}

const Workspace: React.SFC<WorkspaceProps> = ({ value, store }) => {
  const { headId } = value; // ignoring consistentId for now
  const workspaceVersion = store.get(
    "WorkspaceVersion",
    headId
  ) as WorkspaceVersionRow;
  return (
    <div className="Workspace">
      <WorkspaceVersion value={workspaceVersion.value} store={store} />
    </div>
  );
};

export default Workspace;
