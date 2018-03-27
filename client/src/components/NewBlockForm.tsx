import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";
import { valueToDatabaseJSON } from "../lib/slateParser";

export class NewBlockForm extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = {value: {}, id: uuidv1()};
    }

    public render() {
        return (
            <div key={this.state.id}>
                <BlockEditor
                    shouldAutosave={false}
                    readOnly={false}
                    blockId={this.state.id}
                    name={`new-block-${this.state.id}`}
                    initialValue={""}
                    onChange={(value) => this.setState({ value })}
                    availablePointers={this.props.availablePointers || []}
                    onKeyDown={this.onKeyDown}
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

    private onSubmit = () => {
        this.props.onMutate(valueToDatabaseJSON(this.state.value));
        this.setState({ id: uuidv1() });
    }

}