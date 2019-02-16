import * as _ from "lodash";
import { databaseJSONToValue } from "../../lib/slateParser";
import { Auth } from "../../auth";

export enum WorkspaceRelationTypes {
  WorkspaceQuestion = 0,
  WorkspaceScratchpad,
  WorkspaceAnswer,
  WorkspaceSubquestionDraft,
  SubworkspaceQuestion,
  SubworkspaceAnswer,
}

enum Permissions {
  ReadOnly = 0,
  Editable,
}

const QUESTION = "QUESTION";
const ANSWER = "ANSWER";
const SCRATCHPAD = "SCRATCHPAD";
const SUBQUESTION_DRAFT = "SUBQUESTION_DRAFT";

const WORKSPACE = "WORKSPACE";
const SUBWORKSPACE = "SUBWORKSPACE";

const RelationTypeAttributes = [
  {
    name: WorkspaceRelationTypes.WorkspaceQuestion,
    source: WORKSPACE,
    blockType: QUESTION,
    permission: Permissions.ReadOnly,
  },
  {
    name: WorkspaceRelationTypes.WorkspaceScratchpad,
    source: WORKSPACE,
    blockType: SCRATCHPAD,
    permission: Permissions.Editable,
  },
  {
    name: WorkspaceRelationTypes.WorkspaceAnswer,
    source: WORKSPACE,
    blockType: ANSWER,
    permission: Permissions.Editable,
  },
  {
    name: WorkspaceRelationTypes.WorkspaceSubquestionDraft,
    source: WORKSPACE,
    blockType: SUBQUESTION_DRAFT,
    permission: Permissions.Editable,
  },
  {
    name: WorkspaceRelationTypes.SubworkspaceQuestion,
    source: SUBWORKSPACE,
    blockType: QUESTION,
    permission: Permissions.Editable,
  },
  {
    name: WorkspaceRelationTypes.SubworkspaceAnswer,
    source: SUBWORKSPACE,
    blockType: ANSWER,
    permission: Permissions.ReadOnly,
  },
];

export class WorkspaceBlockRelation {
  public workspace;
  public workspaceRelationType;

  public constructor(
    workspaceRelationType: WorkspaceRelationTypes,
    workspace: any
  ) {
    this.workspace = workspace;
    this.workspaceRelationType = workspaceRelationType;
  }

  public blockEditorAttributes() {
    const { permission } = this.relationTypeAttributes();
    const block: any = this.findBlock();
    const editable =
      Auth.isAuthorizedToEditWorkspace(this.workspace) &&
      permission === Permissions.Editable;
    let { value } = block;
    const { id } = block;
    value = databaseJSONToValue(value);
    return {
      name: id,
      blockId: id,
      readOnly: !editable,
      initialValue: value,
      shouldAutosave: editable,
    };
  }

  public findBlock() {
    const { blockType } = this.relationTypeAttributes();
    return this.workspace.blocks.find(b => b.type === blockType);
  }

  public relationTypeAttributes() {
    return _.keyBy(RelationTypeAttributes, "name")[this.workspaceRelationType];
  }
}
export class WorkspaceWithRelations {
  public workspace;
  public constructor(workspace: any) {
    this.workspace = workspace;
  }

  public allReadOnlyBlocks() {
    return this.allReadOnlyBlockRelationships().map(b => b.findBlock());
  }

  private allReadOnlyBlockRelationships() {
    const isReadOnly = relationship =>
      relationship.relationTypeAttributes().permission === Permissions.ReadOnly;
    return this.allTouchingBlockRelationships().filter(isReadOnly);
  }

  private allTouchingBlockRelationships() {
    const relations: any = [];
    _.filter(RelationTypeAttributes, { source: SUBWORKSPACE }).forEach(
      RelationTypeAttribute => {
        this.workspace.childWorkspaces.forEach(childWorkspace => {
          relations.push(
            new WorkspaceBlockRelation(
              RelationTypeAttribute.name,
              childWorkspace
            )
          );
        });
      }
    );

    return relations;
  }
}
