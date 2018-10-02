import * as React from "react";
import styled from "styled-components";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import _ = require("lodash");
import { Button, FormControl } from "react-bootstrap";

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

export class NewBlockForm extends React.Component<any, any> {
  public blockEditor;
  public constructor(props: any) {
    super(props);
    this.state = this.blankState();
  }

  public onChange = blockValue => {
    this.setState({ blockValue });
  }

  public editor() {
    const editor = _.get(this, "blockEditor.wrappedInstance.editor");
    return !!editor && editor();
  }

  public render() {
    if (!this.state.id) {
      return <div />;
    }
    return (
      <div key={this.state.id}>
        <BlockContainer>
          <BlockHeader>New Question</BlockHeader>
          <BlockBody>
            <BlockEditor
              placeholder="Text of a new question..."
              shouldAutosave={false}
              readOnly={false}
              blockId={this.state.id}
              name={`new-block-${this.state.id}`}
              initialValue={""}
              onChange={this.onChange}
              availablePointers={this.props.availablePointers || []}
              onKeyDown={this.onKeyDown}
              ref={input => (this.blockEditor = input)}
              workspaceId={this.props.workspaceId}
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
            <FormControl
              type="input"
              value={this.state.totalBudget}
              placeholder="budget"
              onChange={(e: any) => {
                const { value } = e.target;
                if (value === "") {
                  this.setState({ totalBudget: value });
                }
                const valueAsInt = parseInt(value, 10);
                if (
                  !!valueAsInt &&
                  valueAsInt > 0 &&
                  valueAsInt <= this.props.maxTotalBudget
                ) {
                  this.setState({ totalBudget: valueAsInt });
                }
              }}
            />
            <div className="buttons">
              <Button
                bsSize="xsmall"
                bsStyle="primary"
                type="submit"
                onClick={this.onSubmit}
                style={{ marginTop: "5px" }}
              >
                Submit
              </Button>
            </div>
          </div>
        </BlockContainer>
      </div>
    );
  }

  private onKeyDown = event => {
    const pressedControlAndEnter = _event =>
      _event.metaKey && _event.key === "Enter";

    if (pressedControlAndEnter(event)) {
      event.preventDefault();
      this.onSubmit();
    }
  };

  private blankState = () => ({
    id: uuidv1(),
    blockValue: {},
    totalBudget: this.props.totalBudget || ""
  });

  private onSubmit = () => {
    this.props.onMutate({
      question: valueToDatabaseJSON(this.state.blockValue),
      totalBudget: this.state.totalBudget
    });
    // This isn't the most elegant way to reset the component. If we want to go the full redux route,
    // the state should probably eventually be moved into Redux.
    this.setState(this.blankState());
  };
}
