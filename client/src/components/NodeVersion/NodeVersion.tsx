// FIXME: Handle case where store lookups fail - don't use (... as ...Row)

import * as _ from "lodash";
import * as React from "react";

import Link from "../Link/Link";
import HyperText from "../HyperText/HyperText";
import Store from "../../store";
import {
  NodeVersionValue,
  NodeVersionRow,
  NodeRow,
  RenderNode,
  LinkRow,
  LinkValue
} from "../../data/types";

interface NodeVersionProps {
  value: NodeVersionValue;
  store: Store;
  renderNode?: RenderNode;
  useLatestNodeVersions?: boolean;
}

const InternalNodeVersion: React.SFC<NodeVersionProps> = ({
  value,
  store,
  renderNode
}) => {
  const hyperTextId = value.hyperTextId;
  const hyperText = store.get("HyperText", hyperTextId);
  return (
    <div className="NodeVersion">
      {hyperText ? (
        <HyperText
          value={hyperText.value}
          store={store}
          renderNode={renderNode as RenderNode}
        />
      ) : (
        "Couldn't find hypertext for node version."
      )}
    </div>
  );
};

function retrieveLinkValues(linkIds: Array<string>, store: Store) {
  const links = linkIds.map(linkId => store.get("Link", linkId));
  return links.map(link => (link as LinkRow).value);
}

function fastForwardLinkValues(linkValues: Array<LinkValue>, store: Store) {
  // 1. For each link, retrieve node version, get node id
  const nodeVersionIds = linkValues.map(linkValue => linkValue.nodeVersionId);
  const nodeIds = nodeVersionIds.map(
    nodeVersionId =>
      (store.get("NodeVersion", nodeVersionId) as NodeVersionRow).value.nodeId
  );
  // 2. For each node id, get latest version
  const latestNodeVersionIds = nodeIds.map(
    nodeId => (store.get("Node", nodeId as string) as NodeRow).value.headId
  );
  // 3. Create link values based on latest node versions
  const newLinkValues = linkValues.map((linkValue, i) =>
    _.assign({}, linkValue, { nodeVersionId: latestNodeVersionIds[i] })
  );
  return newLinkValues;
}

function buildNodeMap(linkValues: Array<LinkValue>, store: Store) {
  const nodeMap = {};
  linkValues.forEach(({ nodeVersionId, access }) => {
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
      access
    };
  });
  return nodeMap;
}

const RootNodeVersion: React.SFC<NodeVersionProps> = ({
  value,
  store,
  useLatestNodeVersions
}) => {
  let linkValues = retrieveLinkValues(value.linkIds, store);
  if (useLatestNodeVersions) {
    linkValues = fastForwardLinkValues(linkValues, store);
  }
  const nodeMap = buildNodeMap(linkValues, store);
  const renderNode: RenderNode = ({ value, store }) => {
    const linkValue = nodeMap[value.nodeId];
    if (linkValue) {
      return <Link value={linkValue} store={store} renderNode={renderNode} />;
    } else {
      return <span>Node #{value.nodeId} (unexpanded)</span>;
    }
  };
  return (
    <InternalNodeVersion value={value} store={store} renderNode={renderNode} />
  );
};

const NodeVersion: React.SFC<NodeVersionProps> = props => {
  if (props.renderNode) {
    return <InternalNodeVersion {...props} />;
  }
  return <RootNodeVersion {...props} />;
};

export default NodeVersion;
