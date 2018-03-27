// FIXME: Handle case where store lookups fail - don't use (... as ...Row)

// This is a top-level component. It will never be called recursively within itself.
// We do support nested rendering of question/notes/answer templates, but that is
// distinct from this component, which is responsible for managing the versions
// of all nodes visible on the screen at once.

import * as _ from "lodash";
import * as React from "react";

import Link from "../Link/Link";
import Store from "../../store";
import {
  WorkspaceVersionValue,
  NodeVersionRow,
  LinkRow,
  LinkValue,
  RenderNode
} from "../../data/types";

function retrieveLinkValues(linkIds: Array<string>, store: Store) {
  const links = linkIds.map(linkId => store.get("Link", linkId));
  return links.map(link => (link as LinkRow).value);
}

function fastForwardLinkValues(linkValues: Array<LinkValue>) {
  // 1. For each link, retrieve node version, get node id
  // 2. For each node id, get latest version
  // 3. For latest version of each node, get included node ids and their latest node versions
  // 4. Create artificial link values, making sure links for any new nodes have isExpanded set to false
  // (5. Drop link values that are no longer included?)
  return linkValues;
}

function buildNodeMap(linkValues: Array<LinkValue>, store: Store) {
  const nodeMap = {};
  linkValues.forEach(({ nodeVersionId, access, isExpanded, isRoot }) => {
    // Retrieve node version information
    const nodeVersion = store.get(
      "NodeVersion",
      nodeVersionId
    ) as NodeVersionRow;
    const nodeId = nodeVersion.value.nodeId;
    if (!nodeId) {
      // This shouldn't happen using debug fixtures
      throw new Error(
        `Got node version without nodeId: ${JSON.stringify(nodeVersion)}`
      );
    }
    nodeMap[nodeId] = {
      nodeVersionId,
      access,
      isExpanded
    };
  });
  return nodeMap;
}

interface WorkspaceVersionProps {
  value: WorkspaceVersionValue;
  store: Store;
  useLatestNodeVersions?: boolean;
}

const WorkspaceVersion: React.SFC<WorkspaceVersionProps> = ({
  value,
  store,
  useLatestNodeVersions
}) => {
  let linkValues = retrieveLinkValues(value.linkIds, store);
  if (useLatestNodeVersions) {
    linkValues = fastForwardLinkValues(linkValues);
  }
  const rootLinkValue = _.find(linkValues, linkValue => linkValue.isRoot);
  if (!rootLinkValue) {
    throw new Error("Workspace version without root link!");
  }
  const nodeMap = buildNodeMap(linkValues, store);
  const renderNode: RenderNode = ({ value, store }) => {
    const linkValue = nodeMap[value.nodeId];
    return <Link value={linkValue} store={store} renderNode={renderNode} />;
  };
  return (
    <div className="WorkspaceVersion">
      <Link value={rootLinkValue} store={store} renderNode={renderNode} />
    </div>
  );
};

WorkspaceVersion.defaultProps = {
  useLatestNodeVersions: false
};

export default WorkspaceVersion;
