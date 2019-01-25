import * as React from "react";

import { UserActivityWorkspaceReport } from "./UserActivityWorkspaceReport";

export class UserActivityWorkspaceReports extends React.Component<any, any> {
  public render() {
    const { assignments } = this.props;
    return assignments
      .map((elem, i, arr) => arr[arr.length - 1 - i]) // hacky immutable reverse :)
      .map(assignment => {
        return (
          <UserActivityWorkspaceReport
            assignment={assignment}
          />
        );
      });
  }
}
