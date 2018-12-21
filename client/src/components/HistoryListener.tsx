import * as React from "react";
import { withRouter } from "react-router-dom";

class HistoryListenerBase extends React.Component<any, any> {
  public componentDidUpdate(prevProps: any) {
    if (this.props.location.pathname !== prevProps.location.pathname) {
      this.props.onPathnameChange();
    }
  }

  public render() {
    return null;
  }
}

export const HistoryListener: any = withRouter(HistoryListenerBase);
