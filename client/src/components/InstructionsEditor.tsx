import * as React from "react";
import { Button } from "react-bootstrap";
import * as ReactMarkdown from "react-markdown";
import Textarea from "react-textarea-autosize";
import { compose } from "recompose";
import gql from "graphql-tag";
import { graphql, MutationFunc } from "react-apollo";

import { Auth } from "../auth";

interface InstructionsEditorProps {
  experimentId: string;
  instructions: string;
  instructionType: string;
  updateExperimentInstructionsMutation: MutationFunc<void, UpdateExperimentInstructionsMutationFunc>;
}

interface InstructionsEditorState {
  instructions: string;
  isEditing: boolean;
  isSavePending: boolean;
}

export class InstructionsEditorPresentational extends React.Component<InstructionsEditorProps, InstructionsEditorState> {
  public state = {
    instructions: this.props.instructions,
    isEditing: false,
    isSavePending: false,
  };

  public render() {
    if (this.state.isEditing) {
      return (
        <div>
          <Textarea
            style={{
              display: "block",
              width: "100%",
            }}
            value={this.state.instructions}
            onChange={this.onInstructionsChange}
            disabled={this.state.isSavePending}
          />
          <br />
          <Button
            bsSize="xsmall"
            bsStyle="primary"
            onClick={this.onSaveClick}
            disabled={this.state.isSavePending}
          >
            {this.state.isSavePending ? "Saving..." : "Save"}
          </Button>
        </div>
      );
    } else {
      return (
        <div>
          <ReactMarkdown source={this.state.instructions} />
          {
            Auth.isAdmin()
            &&
            <Button
              bsSize="xsmall"
              bsStyle="primary"
              onClick={this.onEditClick}
            >
              Edit
            </Button>
          }
        </div>
      );
    }
  }

  private onEditClick = () => this.setState({ isEditing: true });

  private onInstructionsChange = change => this.setState({ instructions: change.target.value });

  private onSaveClick = () => {
    this.setState({ isSavePending: true }, async () => {
      await this.props.updateExperimentInstructionsMutation({
        variables: {
          experimentId: this.props.experimentId,
          type: this.props.instructionType,
          instructions: this.state.instructions,
        }
      });
      this.setState({
        isEditing: false,
        isSavePending: false,
      });
    });
  }
}

interface UpdateExperimentInstructionsMutationFunc {
  experimentId: string;
  type: string;
  instructions: string;
}

const UPDATE_EXPERIMENT_INSTRUCTIONS_MUTATION = gql`
  mutation updateExperimentInstructions($experimentId: String, $type: InstructionsEnum, $instructions: String) {
    updateExperimentInstructions(experimentId: $experimentId, type: $type, instructions: $instructions)
  }
`;

export const InstructionsEditor: any = compose(
  graphql(UPDATE_EXPERIMENT_INSTRUCTIONS_MUTATION, {
    name: "updateExperimentInstructionsMutation",
  })
)(InstructionsEditorPresentational);
