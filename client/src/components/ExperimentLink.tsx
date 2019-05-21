import * as React from "react";
import { Link } from "react-router-dom";

export class ExperimentLink extends React.Component<any, any> {
  public render() {
    return (
      <Link to={`/e/${this.props.experiment.id}`}>{this.props.children}</Link>
    );
  }
}
