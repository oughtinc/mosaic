import * as _ from "lodash";
import * as React from "react";

import { UserActivityWorkspaceReport } from "./UserActivityWorkspaceReport";

export class UserActivityWorkspaceReports extends React.Component<any, any> {
  public render() {
    const { assignments } = this.props;

    const sortedAssignemnts = _.sortBy(
      assignments,
      a => -Number(a.startAtTimestamp),
    );

    return sortedAssignemnts.map((assignment, i, arr) => {
      return (
        <UserActivityWorkspaceReport
          key={
            arr.length -
            i /* same workspace id can be used twice, but new items always added to top of page */
          }
          assignment={assignment}
        />
      );
    });
  }
}
