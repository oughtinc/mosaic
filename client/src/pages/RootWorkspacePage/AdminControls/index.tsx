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
import { Checkbox } from "react-bootstrap";

class AdminControlsPresentational extends React.Component<any, any> {
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
)(AdminControlsPresentational);

export { AdminControls };
