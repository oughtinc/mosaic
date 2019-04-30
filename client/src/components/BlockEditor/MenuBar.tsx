import * as React from "react";
import styled from "styled-components";
import FontAwesomeIcon = require("@fortawesome/react-fontawesome");
import faSpinner = require("@fortawesome/fontawesome-free-solid/faSpinner");
import faCheck = require("@fortawesome/fontawesome-free-solid/faCheck");
import faExclamationTriangle = require("@fortawesome/fontawesome-free-solid/faExclamationTriangle");
import { MutationStatus } from "./types";

const SavingIconStyle = styled.span`
  float: right;
  font-size: 0.7em;
  margin-top: 1px;
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

export const MenuBar = ({
  mutationStatus,
  hasChangedSinceDatabaseSave,
  blockEditor,
}) => (
  <div>
    <SavingIcon
      hasChangedSinceDatabaseSave={hasChangedSinceDatabaseSave}
      mutationStatus={mutationStatus}
      blockEditor={blockEditor}
    />
  </div>
);
