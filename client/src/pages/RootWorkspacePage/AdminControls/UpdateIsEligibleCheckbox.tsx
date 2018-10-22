import { graphql } from "react-apollo";
import * as React from "react";
import { Checkbox } from "react-bootstrap";
import { compose } from "recompose";

import {
  UPDATE_WORKSPACE_IS_ELIGIBLE,
} from "../../../graphqlQueries";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
} from "../../../styles";

class UpdateIsEligibleCheckboxPresentational extends React.Component<any, any> {
  public state = {
     isEligibleCheckboxStatusPending: false,
   };

   public componentDidUpdate(prevProps: any, prevState: any) {
     const isEligibleDidChange = this.didIsEligibleChange(prevProps, this.props);

     if (isEligibleDidChange) {
       this.setState({
         isEligibleCheckboxStatusPending: false,
       });
     }
   }

  public render() {
    const workspace = this.props.workspace;

    return (
       <Checkbox
         style={{
           backgroundColor: adminCheckboxBgColor,
           border: `1px solid ${adminCheckboxBorderColor}`,
           borderRadius: "3px",
           padding: "5px 5px 5px 25px",
           opacity: this.state.isEligibleCheckboxStatusPending ? 0.75 : 1,
         }}
         inline={true}
         type="checkbox"
         checked={workspace.isEligibleForAssignment}
         onChange={this.handleOnIsEligibleCheckboxChange}
       >
         {
           this.state.isEligibleCheckboxStatusPending
           ?
           "updating..."
           :
           "is eligible for assignment"
         }
       </Checkbox>
    );
  }

  private didIsEligibleChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace.isEligibleForAssignment !== curWorkspace.isEligibleForAssignment;
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
}

export const UpdateIsEligibleCheckbox: any = compose(
  graphql(UPDATE_WORKSPACE_IS_ELIGIBLE, {
    name: "updateWorkspaceIsEligible",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  })
)(UpdateIsEligibleCheckboxPresentational);
