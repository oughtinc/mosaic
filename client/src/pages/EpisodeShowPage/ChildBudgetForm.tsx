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

const BudgetControlBtn = ({ disabled, label, onClick, style }) => (
  <Button
    bsSize="xsmall"
    bsStyle="default"
    disabled={disabled}
    style={style}
    onClick={onClick}
  >
    {label}
  </Button>
);

export class ChildBudgetForm extends React.Component<
  ChildBudgetFormProps,
  any
> {

  public render() {
    const MIN_BUDGET_FOR_PARENT = 90;
    const MIN_BUDGET_FOR_CHILD = 90;

    const {
      availableBudget,
      childAllocatedBudget,
      childId,
      childRemainingBudget,
      childTotalBudget,
      parentTotalBudget,
    } = this.props;

    const canParentAfford90s =
      availableBudget - 90 >= MIN_BUDGET_FOR_PARENT;

    const canParentAffordChildTotal =
      availableBudget - childTotalBudget >= MIN_BUDGET_FOR_PARENT;

    const halfChildBudget = Math.ceil(childTotalBudget / 2);

    const canChildBudgetDivideBy2 =
      halfChildBudget - childAllocatedBudget >= MIN_BUDGET_FOR_CHILD;

    const canChildBudgetSubtract90 =
      childTotalBudget - 90 - childAllocatedBudget >= MIN_BUDGET_FOR_CHILD;

    const canParentAffordToSetChildToPercent = ({
      availableBudget,
      childAllocatedBudget,
      childRemainingBudget,
      parentTotalBudget,
      percent,
    }: {
      availableBudget: number,
      childAllocatedBudget: number,
      childRemainingBudget: number,
      parentTotalBudget: number,
      percent: number,
    }) => {
      const percentOfTotal = Math.round(parentTotalBudget * percent);

      const budgetToWorkWith = availableBudget + childRemainingBudget;

      const wouldParentGoTooLow =
        budgetToWorkWith - percentOfTotal < MIN_BUDGET_FOR_PARENT;

      const wouldChildGoTooLow =
        percentOfTotal - childAllocatedBudget < MIN_BUDGET_FOR_CHILD;

      return !wouldParentGoTooLow && !wouldChildGoTooLow;
    };

    const maxParentCanAfford = availableBudget - MIN_BUDGET_FOR_PARENT;

    return (
      <FormStyle>
        <BudgetControlBtn
          disabled={!canParentAfford90s}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: childTotalBudget + 90,
            });
          }}
          label="+90s"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={!canParentAffordChildTotal}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: childTotalBudget * 2,
            });
          }}
          label="x2"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={!canChildBudgetDivideBy2}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: Math.ceil(childTotalBudget / 2),
            });
          }}
          label="/2"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={!canChildBudgetSubtract90}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: childTotalBudget - 90,
            });
          }}
          label="-90s"
          style={{ marginRight: "5px" }}
        />
        <span
          style={{
            display: "inline-block",
            textAlign: "center",
            width: "20px",
          }}
        >
        |
        </span>
        <BudgetControlBtn
          disabled={false}
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: childAllocatedBudget,
            });
          }}
          label="min"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={
            !canParentAffordToSetChildToPercent({
              availableBudget,
              childAllocatedBudget,
              childRemainingBudget,
              parentTotalBudget,
              percent: 0.2,
            })
          }
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: Math.round(parentTotalBudget * 0.2),
            });
          }}
          label="20%"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={
            !canParentAffordToSetChildToPercent({
              availableBudget,
              childAllocatedBudget,
              childRemainingBudget,
              parentTotalBudget,
              percent: 0.4,
            })
          }
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: Math.round(parentTotalBudget * 0.4),
            });
          }}
          label="40%"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={
            !canParentAffordToSetChildToPercent({
              availableBudget,
              childAllocatedBudget,
              childRemainingBudget,
              parentTotalBudget,
              percent: 0.8,
            })
          }
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: Math.round(parentTotalBudget * 0.8),
            });
          }}
          label="80%"
          style={{ marginRight: "5px" }}
        />
        <BudgetControlBtn
          disabled={
            maxParentCanAfford <= 0
            ||
            maxParentCanAfford - childAllocatedBudget < MIN_BUDGET_FOR_CHILD
          }
          onClick={() => {
            this.props.onUpdateChildTotalBudget({
              childId,
              totalBudget: childTotalBudget + availableBudget - MIN_BUDGET_FOR_PARENT,
            });
          }}
          label="max"
          style={undefined}
        />
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
