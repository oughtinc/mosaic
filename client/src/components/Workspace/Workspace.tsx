// This is a top-level component. It will never be called recursively when we're rendering
// a hierarchy of nodes.

import * as React from "react";

import Store from "../../store";
import WorkspaceVersion from "../WorkspaceVersion/WorkspaceVersion";
import { WorkspaceValue, WorkspaceVersionRow } from "../../data/types";

import "./Workspace.css";

enum WorkspaceVersionTag {
  Head = "Head",
  Consistent = "Consistent",
  Latest = "Latest"
}

interface WorkspaceVersionLinkProps {
  versionName: WorkspaceVersionTag;
  selectVersion: (tag: WorkspaceVersionTag) => void;
  selectedVersion: WorkspaceVersionTag;
}

const WorkspaceVersionLink: React.SFC<WorkspaceVersionLinkProps> = ({
  versionName,
  selectVersion,
  selectedVersion
}) => {
  // tslint:disable-next-line jsx-no-lambda
  const handleSelectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    selectVersion(versionName);
  };
  return (
    <a
      href="#select"
      onClick={handleSelectClick}
      className={
        versionName === selectedVersion
          ? "WorkspaceVersionLink-Selected"
          : "WorkspaceVersionLink"
      }
    >
      {versionName}
    </a>
  );
};

interface WorkspaceProps {
  value: WorkspaceValue;
  store: Store;
}

interface WorkspaceState {
  selectedVersion: WorkspaceVersionTag;
}

class Workspace extends React.Component<WorkspaceProps, WorkspaceState> {
  constructor(props: WorkspaceProps) {
    super(props);
    this.state = {
      selectedVersion: WorkspaceVersionTag.Head
    };
  }

  selectVersion = (selectedVersion: WorkspaceVersionTag) => {
    this.setState({ selectedVersion });
  };

  selectedVersionId() {
    const { headId, consistentId } = this.props.value;
    if (this.state.selectedVersion === WorkspaceVersionTag.Consistent) {
      return consistentId;
    }
    // For both head and snapshot, we start from head; the difference
    // is that for snapshot, we retrieve the latest version of all nodes.
    return headId;
  }

  render() {
    const selectedVersionId = this.selectedVersionId();
    const workspaceVersion = this.props.store.get(
      "WorkspaceVersion",
      selectedVersionId
    ) as WorkspaceVersionRow;
    const versionTags = [
      WorkspaceVersionTag.Head,
      WorkspaceVersionTag.Consistent,
      WorkspaceVersionTag.Latest
    ];
    const useLatestNodeVersions =
      this.state.selectedVersion === WorkspaceVersionTag.Latest;
    return (
      <div className="Workspace">
        <div className="Workspace-Version-Selector">
          {versionTags.map(tag => (
            <>
              <WorkspaceVersionLink
                key={tag}
                versionName={tag}
                selectVersion={this.selectVersion}
                selectedVersion={this.state.selectedVersion}
              />{" "}
            </>
          ))}
          - displaying {selectedVersionId}
          {useLatestNodeVersions && ", using latest node versions"}
        </div>
        <WorkspaceVersion
          value={workspaceVersion.value}
          store={this.props.store}
          useLatestNodeVersions={useLatestNodeVersions}
        />
      </div>
    );
  }
}

export default Workspace;
