import { graphql } from "react-apollo";
import * as React from "react";
import { Checkbox } from "react-bootstrap";
import { compose } from "recompose";

import {
  UPDATE_WORKSPACE_IS_ELIGIBLE,
  UPDATE_WORKSPACE_IS_PUBLIC,
} from "../../graphqlQueries";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
} from "../../styles";

class AdminControlsPresentational extends React.Component<any, any> {
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

    return (
       <div
         style={{
           marginBottom: "5px",
         }}
       >
         <Checkbox
           style={{
             backgroundColor: adminCheckboxBgColor,
             border: `1px solid ${adminCheckboxBorderColor}`,
             borderRadius: "3px",
             padding: "5px 5px 5px 25px",
             opacity: this.state.isPublicCheckboxStatusPending ? 0.75 : 1,
           }}
           inline={true}
           type="checkbox"
           checked={workspace.isPublic}
           onChange={this.handleOnIsPublicCheckboxChange}
         >
           {
             this.state.isPublicCheckboxStatusPending
             ?
             "updating..."
             :
             "appears on front page"
           }
         </Checkbox>
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
       </div>
    );
  }

  private didIsEligibleChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace.isEligibleForAssignment !== curWorkspace.isEligibleForAssignment;
  }

  private didIsPublicChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace.isPublic !== curWorkspace.isPublic;
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
}

export const AdminControls: any = compose(
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
