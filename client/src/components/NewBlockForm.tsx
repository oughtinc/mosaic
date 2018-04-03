import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";
import _ = require("lodash");
import { FormControl } from "react-bootstrap";

export class NewBlockForm extends React.Component<any, any> {
    public blockEditor;

    public constructor(props: any) {
        super(props);
        this.state = this.blankState();
    }

    public editor() {
        const editor = _.get(this, "blockEditor.wrappedInstance.editor");
        return !!editor && editor();
    }

    public render() {
        if (!this.state.id) { return (<div/>); }
        return (
            <div key={this.state.id}>
                <BlockEditor
                    shouldAutosave={false}
                    readOnly={false}
                    blockId={this.state.id}
                    name={`new-block-${this.state.id}`}
                    initialValue={""}
                    onChange={(blockValue) => this.setState({ blockValue })}
                    availablePointers={this.props.availablePointers || []}
                    onKeyDown={this.onKeyDown}
                    ref={(input) => this.blockEditor = input}
                />
                <FormControl
                    type="number"
                    value={this.state.budget}
                    placeholder="budget"
                    onChange={(e: any) => {
                        const {value} = e.target;
                        if (value === "") { this.setState({budget: value}); }
                        const valueAsInt = parseInt(value, 10);
                        if (valueAsInt > 0 && valueAsInt < this.props.maxBudget) {
                            this.setState({budget: valueAsInt});
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

    private onKeyDown = (event) => {
        const pressedControlAndEnter = (_event) => (_event.ctrlKey && _event.key === "Enter");

        if (pressedControlAndEnter(event)) {
            event.preventDefault();
            this.onSubmit();
        }
    }

    private blankState = () => ({
            id: uuidv1(),
            blockValue: {},
            budget: this.props.initialBudget || "",
    })

    private onSubmit = () => {
        this.props.onMutate({question: valueToDatabaseJSON(this.state.blockValue), budget: this.state.budget});
        // This isn't the most elegant way to reset the component. If we want to go the full redux route,
        // the state should probably eventually be moved into Redux.
        this.setState(this.blankState());
    }
}