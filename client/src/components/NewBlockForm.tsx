import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import _ = require("lodash");
import { Button, FormControl } from "react-bootstrap";
import parse = require("parse-duration");
import { resetBlock } from "../modules/blocks/actions";

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

export class NewBlockFormPresentational extends React.Component<any, any> {
  public blockEditor;
  public constructor(props: any) {
    super(props);
    this.state = this.blankState();
  }

  public onChange = blockValue => {
    this.setState({ blockValue });
  };

  public componentWillReceiveProps() {
    if (this.state.pending) {
      console.log("BLOCK EDITOR", this.blockEditor);
    }
    this.setState({ pending: false });
  }

/*  public editor() {
    const editor = _.get(this, "blockEditor.wrappedInstance.editor");
    return !!editor && editor();
  }
*/
  public render() {
    return (
      <div key={this.state.id} style={{ opacity: this.state.pending ? 0.5 : 1 }}>
        <BlockContainer>
          <BlockHeader>New Question</BlockHeader>
          <BlockBody>
            <BlockEditor
              placeholder="Text of a new question..."
              shouldAutosave={this.props.shouldAutosave}
              readOnly={false}
              blockId={this.props.blockId ? this.props.blockId : this.state.id}
              name={`new-block-${this.state.id}`}
              initialValue={this.props.initialValue || ""}
              onChange={this.onChange}
              availablePointers={this.props.availablePointers || []}
              onKeyDown={this.onKeyDown}
              /*ref={input => (this.blockEditor = input)}*/
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
              placeholder="budget (e.g., 5m10s)"
              onChange={(e: any) => {
                const { value } = e.target;
                if (value === "") {
                  this.setState({ totalBudget: value });
                }

                const isParseable = !!parse(value);

                if (isParseable) {
                  this.setState({ totalBudget: value });
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
    pending: false,
    totalBudget: this.props.totalBudget || "",
  });

  private onSubmit = () => {
    this.setState({ pending: true });
    this.props.resetBlock({ id: this.props.blockId });
    const isAStringOfNumbers = s => /^\d+$/.exec(s);

    this.props.onMutate({
      question: valueToDatabaseJSON(this.state.blockValue),
      // totalBudget is either a string of numbers, in which case it's
      // interpreted as seconds, or a duration string, in which case it is
      // parsed into milliseconds, and then divided by 1000 to get seconds
      totalBudget: isAStringOfNumbers(this.state.totalBudget) ? this.state.totalBudget : (parse(this.state.totalBudget) / 1000),
    });
  };
}

const mapDispatchToProps = dispatch => ({
  resetBlock: ({ id }) => dispatch(resetBlock({ id })),
})

export const NewBlockForm = connect(
  undefined,
  mapDispatchToProps,
)(NewBlockFormPresentational);
