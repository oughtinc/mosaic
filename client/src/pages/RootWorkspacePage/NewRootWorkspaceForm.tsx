import * as React from "react";
import { NewBlockForm } from "../../components/NewBlockForm";

class NewRootWorkspaceForm extends React.Component<any, any> {
  public render() {
    return (
      <div style={this.props.style}>
        <NewBlockForm
          maxTotalBudget={100000}
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
