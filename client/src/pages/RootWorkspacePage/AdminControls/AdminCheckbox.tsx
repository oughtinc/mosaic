import * as React from "react";
import { graphql } from "react-apollo";
import { Checkbox } from "react-bootstrap";
import { compose } from "recompose";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
} from "../../../styles";

class AdminCheckbox extends React.Component<any, any> {
  public state = {
    isStatusPending: false,
  };

  public componentDidUpdate(prevProps: any, prevState: any) {
    const didStatusChange = this.didStatusChange(prevProps, this.props);

    if (didStatusChange) {
      this.setState({ isStatusPending: false });
    }
  }

  public render() {
    const {
      workspace,
      workspaceFieldToUpdate
    } = this.props;

    return (
      <Checkbox
        style={{
          backgroundColor: adminCheckboxBgColor,
          border: `1px solid ${adminCheckboxBorderColor}`,
          borderRadius: "3px",
          padding: "5px 5px 5px 25px",
          opacity: this.state.isStatusPending ? 0.75 : 1,
        }}
        inline={true}
        type="checkbox"
        checked={workspace[workspaceFieldToUpdate]}
        onChange={this.handleStatusChange}
      >
        {
          this.state.isStatusPending
          ?
          "updating..."
          :
          this.props.checkboxLabelText
        }
      </Checkbox>
    );
  }

  private handleStatusChange = () => {
    if (this.state.isStatusPending) {
      return;
    }

    this.setState({ isStatusPending: true }, () =>
      console.log({
        variables: {
          [this.props.workspaceFieldToUpdate]: !this.props.workspace[this.props.workspaceFieldToUpdate],
          workspaceId: this.props.workspace.id
        }
      })
      ||
      this.props.updateMutation({
        variables: {
          [this.props.workspaceFieldToUpdate]: !this.props.workspace[this.props.workspaceFieldToUpdate],
          workspaceId: this.props.workspace.id
        }
      })
    );
  }

  private didStatusChange = (prevProps: any, curProps: any) => {
    const prevWorkspace = prevProps.workspace;
    const curWorkspace = curProps.workspace;
    return prevWorkspace[this.props.workspaceFieldToUpdate] !== curWorkspace[this.props.workspaceFieldToUpdate];
  }
}
export { AdminCheckbox };
