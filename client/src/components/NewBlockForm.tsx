import * as React from "react";
import styled from "styled-components";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import _ = require("lodash");
import { FormControl } from "react-bootstrap";

const BlockContainer = styled.div`
  background-color: #fff;
  padding: 5px 10px;
`;

const BlockOuterContainer = styled.div`
  box-shadow: 0 8px 10px 1px rgba(0,0,0,0.035), 0 3px 14px 2px rgba(0,0,0,0.03), 0 5px 5px -3px rgba(0,0,0,0.05);
  margin-bottom: 20px;
`;

const BlockHeader = styled.div`
  background-color: #f7f7f7;
  border-bottom: 1px solid #ddd;
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
            <div style={{
              backgroundColor: "#f7f7f7",
              borderTop: "1px solid #ddd",
              padding: "10px",
            }}>
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
                <button type="submit" onClick={this.onSubmit}>
                  Submit
                </button>
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
