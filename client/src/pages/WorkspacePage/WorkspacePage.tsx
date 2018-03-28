import * as React from "react";
import { RouteComponentProps, Link } from "react-router-dom";

import Workspace from "../../components/Workspace/Workspace";
import Store from "../../store";
import { WorkspaceRow } from "../../data/types";

import "./WorkspacePage.css";

interface MatchParams {
  workspaceId: string;
}

interface WorkspacePageProps extends RouteComponentProps<MatchParams> {
  store: Store;
}

const WorkspacePage: React.SFC<WorkspacePageProps> = props => {
  // load workspace row here
  console.log({ props });
  const workspaceId = props.match.params.workspaceId;
  const workspace = props.store.get("Workspace", workspaceId);
  return (
    <div className="WorkspacePage">
      <div className="WorkspacePage-Header">
        <Link to="/">Home</Link>
      </div>
      {workspace ? (
        <Workspace
          value={(workspace as WorkspaceRow).value}
          store={props.store}
        />
      ) : (
        <div>
          Workspace {workspaceId} not found. Store:<pre>
            {JSON.stringify(props.store, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default WorkspacePage;
