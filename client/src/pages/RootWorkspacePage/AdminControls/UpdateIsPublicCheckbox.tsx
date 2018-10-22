import { graphql } from "react-apollo";
import * as React from "react";
import { Checkbox } from "react-bootstrap";
import { compose } from "recompose";

import {
  UPDATE_WORKSPACE_IS_PUBLIC,
} from "../../../graphqlQueries";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
} from "../../../styles";

class UpdateIsPublicCheckboxPresentational extends React.Component<any, any> {
  public state = {
     isPublicCheckboxStatusPending: false,
   };

   public componentDidUpdate(prevProps: any, prevState: any) {
     const isPublicDidChange = this.didIsPublicChange(prevProps, this.props);

     if (isPublicDidChange) {
       this.setState({
         isPublicCheckboxStatusPending: false,
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
    );
  }

  private didIsPublicChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace.isPublic !== curWorkspace.isPublic;
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

export const UpdateIsPublicCheckbox: any = compose(
  graphql(UPDATE_WORKSPACE_IS_PUBLIC, {
    name: "updateWorkspaceIsPublic",
    options: {
      refetchQueries: ["RootWorkspacesQuery"]
    }
  })
)(UpdateIsPublicCheckboxPresentational);
