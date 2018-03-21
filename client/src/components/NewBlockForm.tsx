import * as React from "react";
import * as uuidv1 from "uuid/v1";
import { BlockEditor } from "./BlockEditor";

export class NewBlockForm extends React.Component<any, any> {
    public constructor(props: any) {
        super(props);
        this.state = {value: {}, id: uuidv1()};
        this.onSubmit = this.onSubmit.bind(this);
    }

    public onSubmit() {
        this.props.onMutate(JSON.stringify(this.state.value.toJSON()));
        this.setState({id: uuidv1()});
    }

    public render() {
        return (
            <div key={this.state.id}>
                <BlockEditor
                    autoSave={false}
                    readOnly={false}
                    blockId={this.state.id}
                    name={`new-block-${this.state.id}`}
                    initialValue={""}
                    onChange={(value) => this.setState({value})}
                    availablePointers={this.props.availablePointers || []}
                    canExport={false}
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