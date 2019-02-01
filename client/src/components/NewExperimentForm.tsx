import gql from "graphql-tag";
import * as React from "react";
import { graphql } from "react-apollo";
import { compose } from "recompose";
import styled from "styled-components";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import { Button, FormControl } from "react-bootstrap";
import { resetBlock } from "../modules/blocks/actions";
import { ChildBudgetBadge } from "./ChildBudgetBadge";

import {
  blockBorderAndBoxShadow,
  blockHeaderCSS,
  blockBodyCSS,
  newQuestionFormFooterBgColor,
  newQuestionFormBorderTopColor,
} from "../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
  margin-bottom: 25px;
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
`;

const BlockHeader = styled.div`
  ${blockHeaderCSS};
`;

export class NewExperimentFormPresentational extends React.Component<any, any> {
  public state= {
    experimentName: "",
  };

  public render() {
    return (
      <div>
        <BlockContainer>
          <BlockHeader>New Experiment</BlockHeader>
          <BlockBody>
            <FormControl 
              componentClass="textarea" 
              onChange={this.onExperimentNameChange}
              placeholder="name of experiment (metadata can be added later on the Experiments page)"
              value={this.state.experimentName}
            />
          </BlockBody>
          <div
            style={{
              backgroundColor: newQuestionFormFooterBgColor,
              borderRadius: "0 0 3px 3px",
              borderTop: `1px solid ${newQuestionFormBorderTopColor}`,
              padding: "10px",
            }}
          >
            <Button
              bsSize="xsmall"
              bsStyle="primary"
              onClick={this.createExperiment}
              type="submit"
            >
              Submit
            </Button>
          </div>
        </BlockContainer>
      </div>
    );
  }
  
  private onExperimentNameChange = e => {
    this.setState({ experimentName: e.target.value });
  };

  private createExperiment = async () => {
    const isSuccessful = await this.props.createExperimentMutation({
      variables: {
        name: this.state.experimentName,
      }
    });
    if (isSuccessful) {
      this.setState({
        experimentName: "",
      });
    } 
  };
}

const CREATE_EXPERIMENT = gql`
  mutation createExperiment($name: String) {
    createExperiment(name: $name)
  }
`;

export const NewExperimentForm: any = compose(
  graphql(CREATE_EXPERIMENT, {
    name: "createExperimentMutation",
    options: {
      refetchQueries: ["experiments"]
    }
  })
)(NewExperimentFormPresentational);
