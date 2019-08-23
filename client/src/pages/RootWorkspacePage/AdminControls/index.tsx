import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { AdminCheckboxThatTogglesWorkspaceField } from "../../../components/AdminCheckboxThatTogglesWorkspaceField";
import { ExperimentsCheckboxes } from "../ExperimentsCheckboxes";
import { UserOracleControls } from "../UserOracleControls";

import {
  UPDATE_WORKSPACE_HAS_IO_CONSTRAINTS,
  UPDATE_WORKSPACE_HAS_TIME_BUDGET,
  UPDATE_WORKSPACE_IS_PUBLIC,
} from "../../../graphqlQueries";
import { Checkbox, FormControl } from "react-bootstrap";

class AdminControlsPresentational extends React.Component<any, any> {
  public state = {
    isSchedulingPriorityUpdatePending: false,
    schedulingPriority: this.props.workspace.tree.schedulingPriority,
  };

  public componentDidUpdate(oldProps: any) {
    const hasReceivedSchedulingPriorityUpdate =
      oldProps.workspace.tree.schedulingPriority !==
      this.props.workspace.tree.schedulingPriority;

    if (
      this.state.isSchedulingPriorityUpdatePending &&
      hasReceivedSchedulingPriorityUpdate
    ) {
      this.setState({
        isSchedulingPriorityUpdatePending: false,
      });
    }
  }

  public render() {
    const workspace = this.props.workspace;

    return (
      <div
        style={{
          marginBottom: "5px",
        }}
      >
        <AdminCheckboxThatTogglesWorkspaceField
          checkboxLabelText="front page"
          cyAttributeName="admin-checkbox-front-page"
          updateMutation={this.props.updateWorkspaceIsPublic}
          workspace={workspace}
          workspaceFieldToUpdate="isPublic"
        />
        <AdminCheckboxThatTogglesWorkspaceField
          checkboxLabelText="time budget"
          cyAttributeName="admin-checkbox-time-budget"
          updateMutation={this.props.updateWorkspaceHasTimeBudget}
          workspace={workspace}
          workspaceFieldToUpdate="hasTimeBudget"
        />
        <AdminCheckboxThatTogglesWorkspaceField
          checkboxLabelText="i/o constraints"
          cyAttributeName="admin-checkbox-io-constraint"
          updateMutation={this.props.updateWorkspaceHasIOConstraints}
          workspace={workspace}
          workspaceFieldToUpdate="hasIOConstraints"
        />
        <div>
          <Checkbox
            checked={workspace.tree.doesAllowOracleBypass}
            onChange={(e: any) => {
              this.props.updateTreeDoesAllowOracleBypass({
                variables: {
                  treeId: workspace.tree.id,
                  doesAllowOracleBypass: e.target.checked,
                },
              });
            }}
          >
            allow judge-to-judge questions
          </Checkbox>
        </div>
        <div>
          <Checkbox
            checked={workspace.tree.isMIBWithoutRestarts}
            onChange={(e: any) => {
              this.props.updateTreeIsMIBWithoutRestarts({
                variables: {
                  treeId: workspace.tree.id,
                  isMIBWithoutRestarts: e.target.checked,
                },
              });
            }}
          >
            is MIB without restarts
          </Checkbox>
        </div>
        <div
          style={{
            marginBottom: "25px",
            marginTop: "25px",
            opacity: this.state.isSchedulingPriorityUpdatePending ? 0.5 : 1,
          }}
        >
          Scheduling Priority
          <div style={{ fontWeight: 600, fontSize: "12px" }}>
            To change, edit and press enter
          </div>
          <div
            style={{
              color: "red",
              display: isNaN(this.state.schedulingPriority) ? "block" : "none",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            Error: non-numeric value entered
          </div>
          <FormControl
            onChange={e => {
              const target = e.target as HTMLInputElement;

              this.setState({
                schedulingPriority: target.value,
              });
            }}
            onKeyDown={e => {
              const wasEnterKeyPressed = e.key === "Enter";

              const isInputValueNumeric = !isNaN(this.state.schedulingPriority); // note isNaN works with strings

              const doesInputValueDifferFromTreeSchedulingPriority =
                Number(this.state.schedulingPriority) !==
                workspace.tree.schedulingPriority;

              if (
                wasEnterKeyPressed &&
                isInputValueNumeric &&
                doesInputValueDifferFromTreeSchedulingPriority
              ) {
                this.setState({ isSchedulingPriorityUpdatePending: true });

                this.props.updateTreeSchedulingPriority({
                  variables: {
                    treeId: workspace.tree.id,
                    schedulingPriority: Number(this.state.schedulingPriority),
                  },
                });
              }
            }}
            style={{
              border: isNaN(this.state.schedulingPriority) && "1px solid red",
              display: "inline-block",
              marginBottom: "5px",
              width: "150px",
            }}
            type="text"
            value={this.state.schedulingPriority}
          />
        </div>
        <ExperimentsCheckboxes workspace={workspace} />
        <UserOracleControls workspace={workspace} />
      </div>
    );
  }
}

const UPDATE_TREE_DOES_ALLOW_ORACLE_BYPASS = gql`
  mutation updateTreeDoesAllowOracleBypass(
    $treeId: String
    $doesAllowOracleBypass: Boolean
  ) {
    updateTreeDoesAllowOracleBypass(
      treeId: $treeId
      doesAllowOracleBypass: $doesAllowOracleBypass
    )
  }
`;

const UPDATE_TREE_IS_MIB_WITHOUT_RESTARTS = gql`
  mutation updateTreeIsMIBWithoutRestarts(
    $treeId: String
    $isMIBWithoutRestarts: Boolean
  ) {
    updateTreeIsMIBWithoutRestarts(
      treeId: $treeId
      isMIBWithoutRestarts: $isMIBWithoutRestarts
    )
  }
`;

const UPDATE_TREE_SCHEDULING_PRIORITY = gql`
  mutation updateTreeSchedulingPriority(
    $treeId: String
    $schedulingPriority: Int
  ) {
    updateTreeSchedulingPriority(
      treeId: $treeId
      schedulingPriority: $schedulingPriority
    )
  }
`;

const AdminControls: any = compose(
  graphql(UPDATE_WORKSPACE_HAS_IO_CONSTRAINTS, {
    name: "updateWorkspaceHasIOConstraints",
    options: (props: any) => ({
      refetchQueries: props.refetchQueries,
    }),
  }),
  graphql(UPDATE_WORKSPACE_HAS_TIME_BUDGET, {
    name: "updateWorkspaceHasTimeBudget",
    options: (props: any) => ({
      refetchQueries: props.refetchQueries,
    }),
  }),
  graphql(UPDATE_WORKSPACE_IS_PUBLIC, {
    name: "updateWorkspaceIsPublic",
    options: (props: any) => ({
      refetchQueries: props.refetchQueries,
    }),
  }),
  graphql(UPDATE_TREE_DOES_ALLOW_ORACLE_BYPASS, {
    name: "updateTreeDoesAllowOracleBypass",
    options: (props: any) => ({
      refetchQueries: props.refetchQueries,
    }),
  }),
  graphql(UPDATE_TREE_IS_MIB_WITHOUT_RESTARTS, {
    name: "updateTreeIsMIBWithoutRestarts",
    options: (props: any) => ({
      refetchQueries: props.refetchQueries,
    }),
  }),
  graphql(UPDATE_TREE_SCHEDULING_PRIORITY, {
    name: "updateTreeSchedulingPriority",
    options: (props: any) => ({
      refetchQueries: props.refetchQueries,
    }),
  }),
)(AdminControlsPresentational);

export { AdminControls };
