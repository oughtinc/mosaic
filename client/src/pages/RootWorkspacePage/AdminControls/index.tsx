import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";

import { AdminCheckboxThatTogglesWorkspaceField } from "../../../components/AdminCheckboxThatTogglesWorkspaceField";

import {
  UPDATE_WORKSPACE_HAS_IO_CONSTRAINTS,
  UPDATE_WORKSPACE_HAS_TIME_BUDGET,
  UPDATE_WORKSPACE_IS_ELIGIBLE,
  UPDATE_WORKSPACE_IS_PUBLIC,
} from "../../../graphqlQueries";

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
          updateMutation={this.props.updateWorkspaceIsPublic}
          workspace={workspace}
          workspaceFieldToUpdate="isPublic"
        />
        <AdminCheckboxThatTogglesWorkspaceField
          checkboxLabelText="is eligible"
          updateMutation={this.props.updateWorkspaceIsEligible}
          workspace={workspace}
          workspaceFieldToUpdate="isEligibleForAssignment"
        />
        <AdminCheckboxThatTogglesWorkspaceField
          checkboxLabelText="time budget"
          updateMutation={this.props.updateWorkspaceHasTimeBudget}
          workspace={workspace}
          workspaceFieldToUpdate="hasTimeBudget"
        />
        <AdminCheckboxThatTogglesWorkspaceField
          checkboxLabelText="i/o constraints"
          updateMutation={this.props.updateWorkspaceHasIOConstraints}
          workspace={workspace}
          workspaceFieldToUpdate="hasIOConstraints"
        />
      </div>
    );
  }
}

const AdminControls: any = compose(
  graphql(UPDATE_WORKSPACE_HAS_IO_CONSTRAINTS, {
    name: "updateWorkspaceHasIOConstraints",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  }),
  graphql(UPDATE_WORKSPACE_HAS_TIME_BUDGET, {
    name: "updateWorkspaceHasTimeBudget",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  }),
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
)(AdminControlsPresentational);

export { AdminControls };
