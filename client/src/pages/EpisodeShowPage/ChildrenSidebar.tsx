import * as React from "react";
import * as _ from "lodash";
import styled from "styled-components";

import { Button, Checkbox } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BlockEditor } from "../../components/BlockEditor";
import { NewBlockForm } from "../../components/NewBlockForm";
import {
  WorkspaceBlockRelation,
  WorkspaceRelationTypes,
} from "./WorkspaceRelations";
import { BlockBullet } from "../../components/WorkspaceCard/BlockBullet";
import { ChildBudgetBadge } from "../../components/ChildBudgetBadge";
import { ChildBudgetForm } from "./ChildBudgetForm";
import { Auth } from "../../auth";

import {
  adminCheckboxBgColor,
  adminCheckboxBorderColor,
  blockBorderAndBoxShadow,
  blockBorderColor,
  blockHeaderCSS,
  blockBodyCSS,
  subQuestionAnswerFontColor,
  subquestionsFooterBgColor,
  subquestionsFooterBorderTopColor,
} from "../../styles";

const BlockContainer = styled.div`
  ${blockBorderAndBoxShadow};
  margin-bottom: 25px;
`;

const BulletAndEditorContainer = styled.div`
  display: flex;
`;

const BlockEditorContainer = styled.div`
  min-width: 1px;
  flex: 1;
`;

const BlockBody = styled.div`
  ${blockBodyCSS};
  padding: 0;
`;

const BlockHeader = styled.div`
  ${blockHeaderCSS};
`;

const TakeBreakBtn = ({ bsStyle, experimentId, label, navHook, style }: any) => {
  return (
    <Link onClick={navHook} to={`/break?experiment=${experimentId}`} style={{ ...style, display: "inline-block" }}>
      <Button bsSize="small" bsStyle={bsStyle || "primary"}>{label} »</Button>
    </Link>
  );
};

export class Child extends React.Component<any, any> {
  public constructor(props: any) {
    super(props);
    this.state = { showChildBudgetForm: false };
  }

  public render() {
    const { workspace, availablePointers } = this.props;
    const questionRelationship = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.SubworkspaceQuestion,
      workspace
    );
    const answerRelationship = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.SubworkspaceAnswer,
      workspace
    );
    const answerDraftRelationship = new WorkspaceBlockRelation(
      WorkspaceRelationTypes.SubworkspaceAnswerDraft,
      workspace
    );

    const hasTimeBudget = this.props.hasTimeBudget;

    if (workspace.isArchived) {
      return (
        <div
          style={{
            backgroundColor: "#f0f0f0",
            padding: "10px",
          }}
        >
          <div style={{ opacity: 0.5 }}>
            {questionRelationship.findBlock().value && (
              <BlockEditor
                {...questionRelationship.blockEditorAttributes()}
                readOnly={true}
                availablePointers={availablePointers}
                visibleExportIds={this.props.visibleExportIds}
                exportLockStatusInfo={this.props.exportLockStatusInfo}
                unlockPointer={this.props.unlockPointer}
              />
            )}
          </div>

          <div style={{ marginTop: "0.5em" }}>
            {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
              <Button
                bsSize="xsmall"
                bsStyle="default"
                onClick={this.props.onDelete}
                style={{ marginRight: "5px" }}
              >
                Unarchive
              </Button>
            )}
            <div style={{ float: "right", opacity: 0.5 }}>
              {hasTimeBudget && <ChildBudgetBadge
                shouldShowSeconds={false}
                remainingBudget={workspace.totalBudget - workspace.allocatedBudget}
                totalBudget={workspace.totalBudget}
              />}
            </div>
          </div>
          <div style={{ clear: "both "}} />
        </div>
      );
    }

    return (
      <div
        style={{
          backgroundColor: (Auth.isOracle() && this.props.isInOracleMode && workspace.isEligibleForOracle) && "#ffe8e8",
          padding: "10px",
        }}
      >
        {questionRelationship.findBlock().value && (
          <BulletAndEditorContainer>
            <BlockBullet>Q</BlockBullet>
            <BlockEditorContainer>
              <BlockEditor
                {...questionRelationship.blockEditorAttributes()}
                availablePointers={availablePointers}
                visibleExportIds={this.props.visibleExportIds}
                exportLockStatusInfo={this.props.exportLockStatusInfo}
                unlockPointer={this.props.unlockPointer}
                shouldAutoExport={this.props.shouldAutoExport}
                pastedExportFormat={this.props.pastedExportFormat}
              />
            </BlockEditorContainer>
          </BulletAndEditorContainer>
        )}
        <div style={{ color: subQuestionAnswerFontColor, marginTop: "8px" }}>
          {
            (
              this.props.workspace.isCurrentlyResolved
              ? answerDraftRelationship.findBlock().value
              : answerRelationship.findBlock().value
            )
            && (
            <BulletAndEditorContainer>
              <BlockBullet>A</BlockBullet>
              <BlockEditorContainer>
                {
                  this.props.workspace.isCurrentlyResolved
                  ?
                    <BlockEditor
                      {...answerDraftRelationship.blockEditorAttributes()}
                      availablePointers={availablePointers}
                      visibleExportIds={this.props.visibleExportIds}
                      exportLockStatusInfo={this.props.exportLockStatusInfo}
                      unlockPointer={this.props.unlockPointer}
                    />
                  :
                    <BlockEditor
                      {...answerRelationship.blockEditorAttributes()}
                      availablePointers={availablePointers}
                      visibleExportIds={this.props.visibleExportIds}
                      exportLockStatusInfo={this.props.exportLockStatusInfo}
                      unlockPointer={this.props.unlockPointer}
                    />
                }
              </BlockEditorContainer>
            </BulletAndEditorContainer>
          )}
        </div>

        <div style={{ marginTop: "0.5em" }}>
          {!this.props.isIsolatedWorkspace && (
            <Link to={`/workspaces/${workspace.id}`}>
              <Button
                bsSize="xsmall"
                bsStyle="default"
                style={{ marginRight: "5px" }}
              >
                Open »
              </Button>
            </Link>
          )}
          {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
            <Button
              bsSize="xsmall"
              bsStyle="default"
              onClick={this.props.onDelete}
              style={{ marginRight: "5px" }}
            >
              Archive
            </Button>
          )}
          {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && hasTimeBudget && (
            <Button
              bsSize="xsmall"
              bsStyle="default"
              disabled={this.props.availableBudget - 90 < 90}
              style={{ marginRight: "5px" }}
              onClick={() => {
                this.props.onUpdateChildTotalBudget({
                  childId: workspace.id,
                  totalBudget: Number(workspace.totalBudget) + 90,
                });
              }}
            >
              +90s
            </Button>
          )}
          {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && hasTimeBudget && (
            <Button
              bsSize="xsmall"
              bsStyle="default"
              disabled={this.props.availableBudget - this.props.workspace.totalBudget < 90}
              style={{ marginRight: "5px" }}
              onClick={() => {
                this.props.onUpdateChildTotalBudget({
                  childId: workspace.id,
                  totalBudget: workspace.totalBudget * 2,
                });
              }}
            >
              x2 time
            </Button>
          )}
          {!this.state.showChildBudgetForm &&
            Auth.isAuthorizedToEditWorkspace(this.props.workspace) && hasTimeBudget && (
              <Button
                bsSize="xsmall"
                bsStyle="default"
                style={{ fontWeight: 700 }}
                onClick={() => {
                  this.setState({ showChildBudgetForm: true });
                }}
              >
                ⋮
              </Button>
            )}
          <div style={{ float: "right" }}>
            {hasTimeBudget && <ChildBudgetBadge
              shouldShowSeconds={false}
              remainingBudget={workspace.totalBudget - workspace.allocatedBudget}
              totalBudget={workspace.totalBudget}
            />}
          </div>
        </div>
        <div style={{ marginTop: "10px" }}>
          {
            Auth.isOracle()
            &&
            this.props.isInOracleMode
            &&
            <Checkbox
              style={{
                backgroundColor: adminCheckboxBgColor,
                border: `1px solid ${adminCheckboxBorderColor}`,
                borderRadius: "3px",
                padding: "5px 5px 5px 25px",
              }}
              inline={true}
              type="checkbox"
              checked={workspace.isEligibleForOracle}
              onChange={() => {
                this.props.updateIsEligibleForOracle({
                  isEligibleForOracle: !workspace.isEligibleForOracle,
                  workspaceId: workspace.id,
                });
              }}
            >
              is oracle only
            </Checkbox>
          }
        </div>
        {this.state.showChildBudgetForm && hasTimeBudget && (
          <ChildBudgetForm
            availableBudget={this.props.availableBudget}
            childAllocatedBudget={workspace.allocatedBudget}
            childRemainingBudget={workspace.totalBudget - workspace.allocatedBudget}
            childTotalBudget={workspace.totalBudget}
            childId={workspace.id}
            parentTotalBudget={this.props.parentTotalBudget}
            onUpdateChildTotalBudget={this.props.onUpdateChildTotalBudget}
            onClose={() => this.setState({ showChildBudgetForm: false })}
          />
        )}
      </div>
    );
  }
}

export class ChildrenSidebar extends React.Component<any, any> {
  private newChildField;

  public editor = () => {
    return this.newChildField && this.newChildField.editor();
  };

  public shouldComponentUpdate(newProps: any) {
    if (
      !_.isEqual(newProps.blockEditor, this.props.blockEditor) ||
      !_.isEqual(newProps.availablePointers, this.props.availablePointers) ||
      !_.isEqual(newProps.block, this.props.block) ||
      !_.isEqual(newProps.workspaceOrder, this.props.workspaceOrder) ||
      !_.isEqual(newProps.workspaces, this.props.workspaces) ||
      !_.isEqual(newProps.exportLockStatusInfo, this.props.exportLockStatusInfo) ||
      !_.isEqual(newProps.visibleExportIds, this.props.visibleExportIds) ||
      !_.isEqual(newProps.shouldAutoExport, this.props.shouldAutoExport) ||
      !_.isEqual(newProps.pastedExportFormat, this.props.pastedExportFormat)
    ) {
      return true;
    }
    return false;
  }

  public render() {
    return (
      <div>
        {!!this.props.workspaceOrder.length && (
          <BlockContainer>
            <BlockHeader>Subquestions</BlockHeader>
            {this.props.workspaceOrder
              .map((workspaceId, i, arr) => this.props.workspaces.find(
                w => w.id === workspaceId
              ))
              .map((workspace, i, arr) => {
                return (
                  <BlockBody
                    key={workspace.id}
                    style={{
                      borderBottom:
                        i !== arr.length - 1
                          ? `1px solid ${blockBorderColor}`
                          : "none",
                    }}
                  >
                    <Child
                      pastedExportFormat={this.props.pastedExportFormat}
                      shouldAutoExport={this.props.shouldAutoExport}
                      hasTimeBudget={this.props.hasTimeBudget}
                      isArchived={this.props.isArchived}
                      isInOracleMode={this.props.isInOracleMode}
                      updateIsEligibleForOracle={this.props.updateIsEligibleForOracle}
                      isIsolatedWorkspace={this.props.isIsolatedWorkspace}
                      availableBudget={this.props.workspace.totalBudget - this.props.workspace.allocatedBudget}
                      workspace={workspace}
                      key={workspace.id}
                      onDelete={() => {
                        this.props.updateWorkspaceIsArchived({
                          workspaceId: workspace.id,
                          isArchived: !workspace.isArchived,
                        });
                      }}
                      availablePointers={this.props.availablePointers}
                      parentAvailableBudget={this.props.availableBudget}
                      parentTotalBudget={this.props.parentTotalBudget}
                      onUpdateChildTotalBudget={
                        this.props.onUpdateChildTotalBudget
                      }
                      visibleExportIds={this.props.visibleExportIds}
                      exportLockStatusInfo={this.props.exportLockStatusInfo}
                      unlockPointer={this.props.unlockPointer}
                    />
                  </BlockBody>
                );
              })
            }
            {
              Auth.isAuthenticated()
              &&
              this.props.workspaceOrder.length > 0
              &&
              (
                (Auth.isOracle() && this.props.isInOracleMode)
                ||
                this.props.isActive
              )
              &&
              <div
                style={{
                  backgroundColor: subquestionsFooterBgColor,
                  borderRadius: "0 0 3px 3px",
                  borderTop: `1px solid ${subquestionsFooterBorderTopColor}`,
                  padding: "10px",
                }}
              >
                {
                  !(Auth.isOracle() && this.props.isInOracleMode)
                  ?
                    <TakeBreakBtn
                      experimentId={this.props.experimentId}
                      label="Wait for an answer"
                      navHook={() => {
                        this.props.markAsNotStale();
                      }}
                    />
                  :
                    <TakeBreakBtn
                      bsStyle="danger"
                      experimentId={this.props.experimentId}
                      label="Done! (leave budget)"
                      navHook={() => {
                        this.props.updateIsEligibleForOracle({
                          isEligibleForOracle: false,
                          workspaceId: this.props.workspace.id,
                        });
                      }}
                    />
                }
              </div>
            }
          </BlockContainer>
        )}
        {Auth.isAuthorizedToEditWorkspace(this.props.workspace) && (
          <NewBlockForm
            pastedExportFormat={this.props.pastedExportFormat}
            shouldAutoExport={this.props.shouldAutoExport}
            hasTimeBudget={this.props.hasTimeBudget}
            {...this.props.subquestionDraftProps}
            availableBudget={this.props.workspace.totalBudget - this.props.workspace.allocatedBudget}
            parentTotalBudget={this.props.parentTotalBudget}
            workspaceId={this.props.workspace.id}
            maxTotalBudget={this.props.availableBudget}
            onMutate={this.props.onCreateChild}
            availablePointers={this.props.availablePointers}
            shouldAutosave={true}
            visibleExportIds={this.props.visibleExportIds}
            exportLockStatusInfo={this.props.exportLockStatusInfo}
            unlockPointer={this.props.unlockPointer}
          />
        )}
      </div>
    );
  }
}
