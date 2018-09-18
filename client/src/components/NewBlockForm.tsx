import * as React from "react";
import styled from "styled-components";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import _ = require("lodash");
import { Button, FormControl } from "react-bootstrap";

const BlockContainer = styled.div`
  background-color: #fff;
  border-radius: 0 0 3px 3px;
  padding: 10px;
`;

const BlockOuterContainer = styled.div`
  border-radius: 3px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
`;

const BlockHeader = styled.div`
  background-color: #f7f7f7;
  border-bottom: 1px solid #ddd;
  border-radius: 3px 3px 0 0;
  color: #111;
  font-family: "Lato";
  font-size: 18px;
  padding: 5px 10px;
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
        <BlockOuterContainer>
          <BlockHeader>New Question</BlockHeader>
          <BlockContainer>
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
          </BlockContainer>
          <div
            style={{
              backgroundColor: "#f7f7f7",
              borderRadius: "0 0 3px 3px",
              borderTop: "1px solid #ddd",
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
              <Button bsStyle="primary" bsSize="xsmall" type="submit" onClick={this.onSubmit} style={{ marginTop: "5px" }}>
                Submit
              </Button>
            </div>
          </div>
        </BlockOuterContainer>
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
