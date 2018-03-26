import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";

function valueToDatabaseJSON(value: any) {
    return JSON.stringify(value.toJSON().document.nodes[0].nodes);
}

export class NewBlockForm extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = {value: {}, id: uuidv1()};
    }

    public onSubmit = () => {
        this.props.onMutate(valueToDatabaseJSON(this.state.value));
        // this.props.onMutate(JSON.stringify(this.state.value.toJSON()));
        this.setState({id: uuidv1()});
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
                    onChange={(value) => this.setState({value})}
                    availablePointers={this.props.availablePointers || []}
                />
                <div className="buttons">
                    <button type="submit" onClick={this.onSubmit}>
                        Submit
                    </button>
                </div>
            </div>
        );
    }
}