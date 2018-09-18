import * as React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import { Redirect } from "react-router";

export class NextEpisodeShowPagePresentational extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
    this.state = { workspaceId: undefined };
  }

  public async componentDidMount() {
    const response = await this.props.findNextWorkspaceMutation();
    const workspaceId =  response.data.findNextWorkspace.id;
    this.setState({ workspaceId });
  }

  public render() {
    if (!this.state.workspaceId) {
      return <div>Finding your next workspace...</div>;
    } else {
      return (
        <Redirect to={`/workspaces/${this.state.workspaceId}?isolated=true&timer=0:3:0`} />
      );
    }
  }
}

const FIND_NEXT_WORKSPACE_MUTATION = gql`
  mutation findNextWorkspace {
    findNextWorkspace {
      id
    }
  }
`;

export const NextEpisodeShowPage = compose(
  graphql(FIND_NEXT_WORKSPACE_MUTATION, { name: "findNextWorkspaceMutation" })
)(NextEpisodeShowPagePresentational);
