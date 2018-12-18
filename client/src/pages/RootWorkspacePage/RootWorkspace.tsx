import * as React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox } from "react-bootstrap";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import styled from "styled-components";

import { AdminControls } from "./AdminControls";
import { RootBlock } from "./RootBlock";
import { Auth } from "../../auth";
import {
  UPDATE_WORKSPACE_IS_ELIGIBLE,
  UPDATE_WORKSPACE_IS_PUBLIC,
} from "../../graphqlQueries";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
  homepageWorkspaceBgColor,
  homepageWorkspaceScratchpadFontColor,
  blockBorderAndBoxShadow
} from "../../styles";

const WorkspaceContainer = styled.div`
  ${blockBorderAndBoxShadow};
  background-color: ${homepageWorkspaceBgColor};
  padding: 10px;
`;

const ScratchpadContainer = styled.div`
  color: ${homepageWorkspaceScratchpadFontColor};
`;

const workspaceToBlock = (workspace, blockType) =>
  workspace.blocks && workspace.blocks.find(b => b.type === blockType);

class RootWorkspacePresentational extends React.Component<any, any> {
  public state = {
    isEligibleCheckboxStatusPending: false,
    isPublicCheckboxStatusPending: false,
  };

  public componentDidUpdate(prevProps: any, prevState: any) {
    const isEligibleDidChange = this.didIsEligibleChange(prevProps, this.props);
    const isPublicDidChange = this.didIsPublicChange(prevProps, this.props);

    if (isEligibleDidChange || isPublicDidChange) {
      this.setState({
        isEligibleCheckboxStatusPending: isEligibleDidChange ? false : this.state.isEligibleCheckboxStatusPending,
        isPublicCheckboxStatusPending: isPublicDidChange ? false : this.state.isPublicCheckboxStatusPending,
      });
    }
  }

  public render() {
    const workspace = this.props.workspace;

    const question = workspaceToBlock(workspace, "QUESTION");
    const answer = workspaceToBlock(workspace, "ANSWER");
    const scratchpad = workspaceToBlock(workspace, "SCRATCHPAD");

    return (
      <WorkspaceContainer style={this.props.style}>
        {
          Auth.isAdmin()
          &&
          <AdminControls workspace={workspace} />
        }
        <Link to={`/workspaces/${workspace.id}`}>
          <RootBlock
            availablePointers={workspace.connectedPointers}
            block={question}
          />
        </Link>

        {" "}

        <RootBlock
          availablePointers={workspace.connectedPointers}
          block={answer}
        />

        <Link to={`/workspaces/${workspace.id}/subtree`}>
          <Button
            bsSize="xsmall"
            bsStyle="default"
            className="pull-right"
            style={{
              margin: "5px 1px",
              padding: "1px 4px",
            }}
          >
            Tree »
          </Button>
        </Link>

        <ScratchpadContainer>
          <RootBlock
            availablePointers={workspace.connectedPointers}
            block={scratchpad}
          />
        </ScratchpadContainer>

        <div style={{ clear: "both" }} />
      </WorkspaceContainer>
    );
  }

  private handleOnIsEligibleCheckboxChange = () => {
    if (this.state.isEligibleCheckboxStatusPending) {
      return;
    }

    this.setState({ isEligibleCheckboxStatusPending: true }, () => {
      // the setTimeout here can be removed if desired
      // it is only here so the user has a moment to see the "Updating"
      // message if the server responds very quickly
      setTimeout(() => {
        this.props.updateWorkspaceIsEligible({
          variables: {
            isEligible: !this.props.workspace.isEligibleForAssignment,
            workspaceId: this.props.workspace.id,
          }
        });
      }, 200);
    });
  }

  private didIsEligibleChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace.isEligibleForAssignment !== curWorkspace.isEligibleForAssignment;
  }

  private handleOnIsPublicCheckboxChange = () => {
    if (this.state.isPublicCheckboxStatusPending) {
      return;
    }

    this.setState({ isPublicCheckboxStatusPending: true }, () => {
      // the setTimeout here can be removed if desired
      // it is only here so the user has a moment to see the "Updating"
      // message if the server responds very quickly
      setTimeout(() => {
        this.props.updateWorkspaceIsPublic({
          variables: {
            isPublic: !this.props.workspace.isPublic,
            workspaceId: this.props.workspace.id,
          }
        });
      }, 200);
    });
  }

  private didIsPublicChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace.isPublic !== curWorkspace.isPublic;
  }
}

const RootWorkspace: any = compose(
  graphql(UPDATE_WORKSPACE_IS_ELIGIBLE, {
    name: "updateWorkspaceIsEligible",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  }),
  graphql(UPDATE_WORKSPACE_IS_PUBLIC, {
    name: "updateWorkspaceIsPublic",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  })
)(RootWorkspacePresentational);

export { RootWorkspace };
