import * as React from "react";

import styled from "styled-components";
import { Button, FormControl } from "react-bootstrap";

const FormStyle = styled.div`
  margin-top: 10px;
  background: #eee;
  padding: 10px;
  float: left;
  border-radius: 2px;
`;

interface ChildBudgetFormProps {
    initialValue: number;
    min: number;
    max: number;
    onSubmit: (value: any) => void;
    onClose: () => void; 
}

interface ChildBudgetFormState {
    value: number;
}

export class ChildBudgetForm extends React.Component<ChildBudgetFormProps, ChildBudgetFormState> {
    public constructor(props: any) {
        super(props);
        this.state = { value: this.props.initialValue };
    }

    public render() {
        return (
            <FormStyle>
                <div style={{ width: "100px", float: "left" }}>
                    <FormControl
                        type="number"
                        autoFocus={true}
                        value={this.state.value}
                        placeholder="0"
                        min={this.props.min}
                        max={this.props.max}
                        onChange={(e: any) => {
                            const { value } = e.target;
                            this.setState({ value: parseInt(value, 10) });
                        }}
                    />
                </div>
                {`${this.props.min} to ${this.props.max}`}

                <div style={{ float: "left" }}>
                    <Button
                        onClick={() => {
                            this.props.onSubmit(this.state.value);
                            this.props.onClose();
                        }}
                        disabled={!this.isValid()}
                    >
                        Submit
                    </Button>
                    <Button
                        onClick={this.props.onClose}
                    >
                        Close
                    </Button>
                </div>
            </FormStyle>
        );
    }

    private isValid() {
        const {value} = this.state;
        const inRange = (value >= this.props.min && value <= this.props.max);
        return !!value && inRange;
    }
}