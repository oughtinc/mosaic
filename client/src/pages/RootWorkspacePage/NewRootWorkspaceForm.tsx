import * as React from "react";
import { HomePageHeading } from "./HomePageHeading";
import { NewBlockForm } from "../../components/NewBlockForm";
import { Auth } from "../../auth";

class NewRootWorkspaceForm extends React.Component<any, any> {
  public render() {
    return (
      <div style={this.props.style}>
        <HomePageHeading>
          {
            Auth.isAdmin()
            ?
            "New Question (public)"
            :
            "New Question (unlisted)"
          }
        </HomePageHeading>
        <NewBlockForm
          maxTotalBudget={10000}
          onMutate={this.onCreateWorkspace}
        />
      </div>
    );
  }

  private onCreateWorkspace = ({ question, totalBudget }) => {
    this.props.createWorkspace({
      variables: {
        question,
        totalBudget,
      },
    });
  }
}

export { NewRootWorkspaceForm };
