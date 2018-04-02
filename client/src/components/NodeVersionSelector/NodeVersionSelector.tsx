import * as React from "react";

import { NodeVersionTag } from "../../data/types";

interface NodeVersionLinkProps {
  versionName: NodeVersionTag;
  selectVersionTag: (tag: NodeVersionTag) => void;
  selectedVersionTag: NodeVersionTag;
}

const NodeVersionLink: React.SFC<NodeVersionLinkProps> = ({
  versionName,
  selectVersionTag,
  selectedVersionTag
}) => {
  // tslint:disable-next-line jsx-no-lambda
  const handleSelectClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    selectVersionTag(versionName);
  };
  return (
    <a
      href="#select"
      onClick={handleSelectClick}
      className={
        versionName === selectedVersionTag
               ? "NodeVersionLink-Selected"
               : "NodeVersionLink"
      }
    >
      {versionName}
    </a>
  );
};

interface NodeVersionSelectorProps {
  versionTags: Array<NodeVersionTag>;
  selectVersionTag: (tag: NodeVersionTag) => void;
  selectedVersionTag: NodeVersionTag;
  selectedVersionId: string;
}

const NodeVersionSelector: React.SFC<NodeVersionSelectorProps> = ({
  versionTags,
  selectVersionTag,
  selectedVersionTag,
  selectedVersionId
}) => (
  <div className="Node-Version-Selector">
    {versionTags.map(tag => (
      <span key={tag}>
        <NodeVersionLink
          versionName={tag}
          selectVersionTag={selectVersionTag}
          selectedVersionTag={selectedVersionTag}
        />{" "}
      </span>
    ))}
    - displaying {selectedVersionId}
    {selectedVersionTag === NodeVersionTag.Latest &&
     ", using latest node versions"}
  </div>
);

export default NodeVersionSelector
