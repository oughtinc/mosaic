import styled from "styled-components";
import * as React from "react";
import { BlockSection } from "./BlockSection";
import { ChildrenSection } from "./ChildrenSection";
import { compose } from "recompose";
import { graphql } from "react-apollo";
import _ = require("lodash");
import { WORKSPACE_SUBTREE_QUERY } from "../../graphqlQueries";

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
  connectedPointers: any;
  id: string;
}

interface WorkspaceCardProps {
  parentPointers: ConnectedPointerType[];
  workspaceId: string;
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
    const workspaces: WorkspaceType[] =
      _.get(this.props, "workspaceSubtreeWorkspaces.subtreeWorkspaces") || [];

    const workspace: WorkspaceType | undefined = workspaces.find(
      w => w.id === this.props.workspaceId
    );

    const editable = Auth.isAuthorizedToEditWorkspace(workspace);

    const newPointers: ConnectedPointerType[] = _.chain(workspaces)
      .map((w: any) => w.connectedPointers)
      .flatten()
      .uniqBy(getPointerId)
      .map(node => {
        return { ...node, readOnly: !editable };
      })
      .value();

    const availablePointers: ConnectedPointerType[] = _.chain(
      this.props.parentPointers
    )
      .concat(newPointers)
      .uniqBy(getPointerId)
      .map(node => {
        return { ...node, readOnly: !editable };
      })
      .value();

    if (!workspace) {
      return <div>Loading...</div>;
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
          workspaces={workspaces}
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
const options = ({ workspaceId }) => ({
  variables: { workspaceId }
});

export const WorkspaceCard: any = compose(
  graphql(WORKSPACE_SUBTREE_QUERY, {
    name: "workspaceSubtreeWorkspaces",
    options
  })
)(WorkspaceCardPresentational);
