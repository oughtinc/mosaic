import * as React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { closeAllPointerReferences } from "../modules/blockEditor/actions";

class ClosePointerListenerBase extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
  }

  public componentDidUpdate(prevProps) {
    // Close all pointers on route change, so that shared pointers do not remain open.
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.props.closeAllPointerReferences();
    }
  }

  public render() {
    return null;
  }
}

export const ClosePointerListener: any = withRouter(connect(null, { closeAllPointerReferences })(ClosePointerListenerBase));