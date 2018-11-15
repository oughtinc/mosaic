import * as React from "react";

import styled from "styled-components";
import { Button } from "react-bootstrap";

import { editBudgetFormBoxShadow } from "../../styles";

const FormStyle = styled.div`
  border-radius: 2px;
  box-shadow: ${editBudgetFormBoxShadow};
  display: inline-block;
  margin-top: 10px;
  padding: 10px;
  line-height: 30px;
`;

interface ChildBudgetFormProps {
  availableBudget: number;
  childId: string;
  childAllocatedBudget: number;
  childRemainingBudget: number;
  childTotalBudget: number;
  parentTotalBudget: number;
  onClose: () => void;
  onUpdateChildTotalBudget(arg: any): void;
}

export class ChildBudgetForm extends React.Component<
  ChildBudgetFormProps,
  any
> {

  public render() {
    return (
      <FormStyle>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            this.props.availableBudget - 90 < 90
            ?
            true
            :
            false
          }
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Number(this.props.childTotalBudget) + 90,
            });
          }}
        >
          +90s
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            this.props.availableBudget - Number(this.props.childTotalBudget) < 90
            ?
            true
            :
            false
          }
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Number(this.props.childTotalBudget) * 2,
            });
          }}
        >
          x2
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            this.props.childAllocatedBudget > Math.ceil(Number(this.props.childTotalBudget) / 2)
            ||
            Math.ceil(Number(this.props.childTotalBudget) / 2) - this.props.childAllocatedBudget < 90
            ?
            true
            :
            false
          }
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Math.ceil(Number(this.props.childTotalBudget) / 2),
            });
          }}
        >
          ÷2
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            this.props.childAllocatedBudget > Number(this.props.childTotalBudget) - 90
            ||
            Number(this.props.childTotalBudget) - 90 - this.props.childAllocatedBudget < 90
            ?
            true
            :
            false
          }
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Number(this.props.childTotalBudget) - 90,
            });
          }}
        >
          -90s
        </Button>
        <span
          style={{
            display: "inline-block",
            textAlign: "center",
            width: "20px",
          }}
        >
        |
        </span>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: this.props.childAllocatedBudget,
            });
          }}
        >
          min
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            (this.props.availableBudget + this.props.childRemainingBudget) < Math.floor(Number(this.props.parentTotalBudget) * 0.2)
            ||
            this.props.childAllocatedBudget > Math.floor(Number(this.props.parentTotalBudget) * 0.2)
            ||
            this.props.availableBudget + this.props.childRemainingBudget - Math.floor(Number(this.props.parentTotalBudget) * 0.2) < 90
            ||
            Math.floor(Number(this.props.parentTotalBudget) * 0.2) < 90
            ?
            true
            :
            false
          }
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Math.floor(Number(this.props.parentTotalBudget) * 0.2),
            });
          }}
        >
          20%
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            (this.props.availableBudget + this.props.childRemainingBudget) < Math.floor(Number(this.props.parentTotalBudget) * 0.4)
            ||
            this.props.childAllocatedBudget > Math.floor(Number(this.props.parentTotalBudget) * 0.4)
            ||
            this.props.availableBudget + this.props.childRemainingBudget - Math.floor(Number(this.props.parentTotalBudget) * 0.4) < 90
            ||
            Math.floor(Number(this.props.parentTotalBudget) * 0.4) < 90
            ?
            true
            :
            false
          }
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Math.floor(Number(this.props.parentTotalBudget) * 0.4),
            });
          }}
        >
          40%
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            (this.props.availableBudget + this.props.childRemainingBudget) < Math.floor(Number(this.props.parentTotalBudget) * 0.8)
            ||
            this.props.childAllocatedBudget > Math.floor(Number(this.props.parentTotalBudget) * 0.8)
            ||
            this.props.availableBudget + this.props.childRemainingBudget - Math.floor(Number(this.props.parentTotalBudget) * 0.8) < 90
            ||
            Math.floor(Number(this.props.parentTotalBudget) * 0.8) < 90
            ?
            true
            :
            false
          }
          style={{ marginRight: "5px" }}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Math.floor(Number(this.props.parentTotalBudget) * 0.8),
            });
          }}
        >
          80%
        </Button>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          disabled={
            this.props.availableBudget < 90
            ||
            this.props.childAllocatedBudget > Number(this.props.childTotalBudget) + Math.max(0, this.props.availableBudget - 90)
            ?
            true
            :
            false
          }
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId: this.props.childId,
              totalBudget: Number(this.props.childTotalBudget) + Math.max(0, this.props.availableBudget - 90),
            });
          }}
        >
          max
        </Button>
        <span
          style={{
            display: "inline-block",
            textAlign: "center",
            width: "20px",
          }}
        >
        |
        </span>
        <Button
          bsSize="xsmall"
          bsStyle="default"
          style={{ backgroundColor: "#fff8f8" }}
          onClick={this.props.onClose}
        >
          Close
        </Button>
      </FormStyle>
    );
  }
}
