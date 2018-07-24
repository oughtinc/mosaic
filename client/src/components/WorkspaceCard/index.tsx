import styled from "styled-components";
import * as React from "react";
import { BlockSection } from "./BlockSection";
import { ChildrenSection } from "./ChildrenSection";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import _ = require("lodash");
import {
  ROOT_WORKSPACE_SUBTREE_QUERY,
  CHILD_WORKSPACE_SUBTREE_QUERY,
} from "../../graphqlQueries";

import { Auth } from "../../auth";

export enum toggleTypes {
  FULL,
  QUESTION = 0,
  ANSWER,
  SCRATCHPAD,
  CHILDREN
}

const Container = styled.div`
  float: left;
`;

const CardBody = styled.div`
  float: left;
  margin-bottom: 1em;
  width: 40em;
  background: #f2f2f2;
  border-radius: 0 2px 2px 2px;
`;

// TODO: Eventually these should be used in a common file for many cases that use them.
interface ConnectedPointerType {
  data: any;
  isVoid: boolean;
  object: string;
  type: string;
  nodes: any[];
}

interface WorkspaceType {
  blocks: any[];
  childWorkspaceOrder: string[];
  connectedPointersOfSubtree: ConnectedPointerType[];
  id: string;
}

interface WorkspaceCardProps {
  isChild: boolean;
  parentPointers: ConnectedPointerType[];
  workspaceId: string;
  subtreeQuery: SubtreeQuery;
}

interface SubtreeQuery {
  loading: boolean;
  workspace: any;
}

interface WorkspaceCardState {
  toggles: {
    [toggleTypes.SCRATCHPAD]: boolean;
    [toggleTypes.CHILDREN]: boolean;
  };
}

const getPointerId = (p: any) => p.data.pointerId;

export class WorkspaceCardPresentational extends React.PureComponent<
  WorkspaceCardProps,
  WorkspaceCardState
> {
  public constructor(props: any) {
    super(props);
    this.state = {
      toggles: {
        [toggleTypes.SCRATCHPAD]: true,
        [toggleTypes.CHILDREN]: true
      }
    };
  }

  public handleChangeToggle = (name: toggleTypes, value: boolean) => {
    const newToggles = { ...this.state.toggles };
    newToggles[name] = value;
    this.setState({ toggles: newToggles });
  };

  public render() {
    const workspace: WorkspaceType | undefined =
      this.props.subtreeQuery.loading
      ?
      undefined
      :
      this.props.subtreeQuery.workspace;

    const editable = Auth.isAuthorizedToEditWorkspace(workspace);

    const availablePointers: ConnectedPointerType[] =
      this.props.isChild
      ?
      this.props.parentPointers
      :
        (
          workspace
          ?
          _(workspace.connectedPointersOfSubtree)
            .uniqBy(getPointerId)
            .map(node => ({...node, readOnly: !editable }))
            .value()
          :
          []
        );

    if (!workspace) {
      return (
        <div>
          {
            !this.props.isChild
            ?
            "Loading... This may take some time for complex trees."
            :
            "Loading..."
          }
        </div>
      );
    }
    return (
      <Container>
        <CardBody>
          <BlockSection
            workspace={workspace}
            availablePointers={availablePointers}
          />
        </CardBody>
        <ChildrenSection
          parentPointers={availablePointers}
          workspace={workspace}
          childrenToggle={this.state.toggles[toggleTypes.CHILDREN]}
          onChangeToggle={() =>
            this.handleChangeToggle(
              toggleTypes.CHILDREN,
              !this.state.toggles[toggleTypes.CHILDREN]
            )
          }
        />
      </Container>
    );
  }
}

const optionsForRoot = ({ workspaceId, isChild }) => ({
  variables: { workspaceId },
  skip: isChild
});

const optionsForChild = ({ workspaceId, isChild }) => ({
  variables: { workspaceId },
  skip: !isChild
});

export const WorkspaceCard: any = compose(
  graphql(ROOT_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForRoot,
  }),
  graphql(CHILD_WORKSPACE_SUBTREE_QUERY, {
    name: "subtreeQuery",
    options: optionsForChild,
  }),
)(WorkspaceCardPresentational);
