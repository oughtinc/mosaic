import * as React from "react";

import { UpdateIsEligibleCheckbox } from "./UpdateIsEligibleCheckbox";
import { UpdateIsPublicCheckbox } from "./UpdateIsPublicCheckbox";

class AdminControls extends React.Component<any, any> {
  public render() {
    return (
       <div
         style={{
           marginBottom: "5px",
         }}
       >
         <UpdateIsPublicCheckbox
           workspace={this.props.workspace}
         />
         <UpdateIsEligibleCheckbox
           workspace={this.props.workspace}
         />
       </div>
    );
  }
}

export { AdminControls };
