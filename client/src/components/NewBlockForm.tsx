import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import _ = require("lodash");
import { FormControl } from "react-bootstrap";

import { getExportsFromNodeAndDescendants } from "../slate-helpers/slate-utils/getInlinesFromNodeAndDescendants";

export class NewBlockForm extends React.Component<any, any> {
  public blockEditor;
  public numOfPointerExports;

  public constructor(props: any) {
    super(props);
    this.state = this.blankState();
    this.numOfPointerExports = 0;
  }

  public shouldComponentUpdate(nextProps: any, nextState: any) {
    // initially, this.state.blockValue is an empty object {}
    // if it hasn't been updated yet, we just update as usual
    if (typeof nextState.blockValue.toJSON !== "function") {
      return true;
    }

    // otherwise we'll check to see if the number of
    // exported pointers has changed

    const valueAsJSON = nextState.blockValue.toJSON();
    const pointerExports: any[] = getExportsFromNodeAndDescendants(valueAsJSON.document);

    // if the number of pointers has changed, we send
    // the pointers up the React hierarchy to the EpisodeShowPage
    // to add to availablePointers
    if (this.numOfPointerExports !== pointerExports.length) {
      this.props.setExportsInNewQuestionForm(pointerExports);
      this.numOfPointerExports = pointerExports.length;

      // we can return false here because the change to availablePointers
      // up the hierarchy will trigger a new update
      return false;
    }

    return true;
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
        />
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
