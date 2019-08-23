import * as React from "react";
import styled from "styled-components";
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faSpinner = require("@fortawesome/fontawesome-free-solid/faSpinner");
import faCheck = require("@fortawesome/fontawesome-free-solid/faCheck");
import faExclamationTriangle = require("@fortawesome/fontawesome-free-solid/faExclamationTriangle");
import { MutationStatus } from "./types";
import { POINTER_EDGE_SPACE } from "../../lib/slate-pointers/exportedPointerSpacer";

const SavingIconStyle = styled.span`
  float: right;
  font-size: 0.7em;
  margin-top: 1px;
`;

const CharacterCounterStyle = styled.span`
  float: right;
  font-size: 0.7em
  margin-top: 1px;
  margin-right: 3px;
  margin-left: 5px;
  color: gray;
`;

const Icons = {
  [MutationStatus.NotStarted]: null,
  [MutationStatus.Loading]: (
    <FontAwesomeIcon
      icon={faSpinner}
      spin={true}
      style={{ color: "rgb(150,150,150)" }}
    />
  ),
  [MutationStatus.Complete]: (
    <FontAwesomeIcon icon={faCheck} style={{ color: "rgb(167, 204, 167)" }} />
  ),
  [MutationStatus.Error]: (
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      style={{ color: "#ef0707" }}
    />
  ),
};

const SavingIcon = ({
  mutationStatus,
  hasChangedSinceDatabaseSave,
  blockEditor,
}) => {
  const Icon = Icons[mutationStatus.status];
  const inErrorState = mutationStatus === MutationStatus.Error;

  // if the user types more after we show the icon,
  // only continue to show it if there's an error
  // to avoid distracting them w/ unimportant information.
  if (!hasChangedSinceDatabaseSave || inErrorState) {
    return <SavingIconStyle>{Icon}</SavingIconStyle>;
  } else {
    return <span />;
  }
};

function getLocalCharCount(nodeOrNodes: any): number {
  let nodes;
  if (Array.isArray(nodeOrNodes)) {
    nodes = nodeOrNodes;
  } else {
    nodes = nodeOrNodes.nodes;
  }

  let result = 0;

  for (const node of nodes) {
    if (node.object === "leaf" || node.object === "text") {
      result += node.leaves
        .reduce((acc: string, val) => {
          return `${acc}${val.text}`;
        }, "")
        .split("")
        .filter(char => char !== POINTER_EDGE_SPACE).length;
    } else if (node.type === "pointerImport") {
      result += 1;
    } else if (node.type !== "pointerExport" && node.nodes) {
      result += getLocalCharCount(node.nodes);
    }
  }

  return result;
}

const CharacterCounter = ({ value }) => {
  if (!value) {
    return <span />;
  }

  const characterCount = getLocalCharCount(value.document.toJSON());
  return <CharacterCounterStyle>{characterCount}</CharacterCounterStyle>;
};

export const MenuBar = ({
  mutationStatus,
  hasChangedSinceDatabaseSave,
  blockEditor,
  value,
}) => (
  <div>
    <SavingIcon
      hasChangedSinceDatabaseSave={hasChangedSinceDatabaseSave}
      mutationStatus={mutationStatus}
      blockEditor={blockEditor}
    />
    <CharacterCounter value={value} />
  </div>
);
