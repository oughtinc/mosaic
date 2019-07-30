import * as uuidv1 from "uuid/v1";
import * as _ from "lodash";
import { databaseJSONToValue } from "../../lib/slateParser";
import { Auth } from "../../auth";

import { getIsUserInExperimentFromQueryParams } from "../../helpers/getIsUserInExperimentFromQueryParams";

export enum WorkspaceRelationTypes {
  WorkspaceQuestion = 0,
  WorkspaceScratchpad,
  WorkspaceAnswer,
  WorkspaceSubquestionDraft,
  WorkspaceAnswerDraft,
  WorkspaceOracleAnswerCandidate,
  SubworkspaceQuestion,
  SubworkspaceAnswer,
  SubworkspaceAnswerDraft,
  RootWorkspaceScratchpad,
}

enum Permissions {
  ReadOnly = 0,
  Editable,
}

const QUESTION = "QUESTION";
const ANSWER = "ANSWER";
const SCRATCHPAD = "SCRATCHPAD";
const SUBQUESTION_DRAFT = "SUBQUESTION_DRAFT";
const ANSWER_DRAFT = "ANSWER_DRAFT";
const ORACLE_ANSWER_CANDIDATE = "ORACLE_ANSWER_CANDIDATE";

const WORKSPACE = "WORKSPACE";
const SUBWORKSPACE = "SUBWORKSPACE";
const ROOT_WORKSPACE = "ROOT_WORKSPACE";

const isUserInExperiment = getIsUserInExperimentFromQueryParams(
  window.location.search,
);

const RelationTypeAttributes = [
  {
    name: WorkspaceRelationTypes.WorkspaceQuestion,
    source: WORKSPACE,
    blockType: QUESTION,
    permission:
      Auth.isAdmin() && !isUserInExperiment
        ? Permissions.Editable
        : Permissions.ReadOnly,
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
    name: WorkspaceRelationTypes.WorkspaceAnswerDraft,
    source: WORKSPACE,
    blockType: ANSWER_DRAFT,
    permission: Permissions.Editable,
  },
  {
    name: WorkspaceRelationTypes.WorkspaceOracleAnswerCandidate,
    source: WORKSPACE,
    blockType: ORACLE_ANSWER_CANDIDATE,
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
  {
    name: WorkspaceRelationTypes.SubworkspaceAnswerDraft,
    source: SUBWORKSPACE,
    blockType: ANSWER_DRAFT,
    permission: Permissions.ReadOnly,
  },
  {
    name: WorkspaceRelationTypes.RootWorkspaceScratchpad,
    source: ROOT_WORKSPACE,
    blockType: SCRATCHPAD,
    permission: Permissions.ReadOnly,
  },
];

export class WorkspaceBlockRelation {
  public workspace;
  public workspaceRelationType;

  public constructor(
    workspaceRelationType: WorkspaceRelationTypes,
    workspace: any,
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
      initialValue:
        permission === Permissions.Editable ? value : outputsToInputs(value),
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

function outputsToInputs(value: any) {
  const node = value.document.nodes[0];
  if (node == null || node.nodes == null) {
    return value;
  }
  const newNodes = node.nodes.map(n => {
    if (n.type && n.type === "pointerExport") {
      return {
        object: "inline",
        type: "pointerImport",
        isVoid: true,
        data: {
          pointerId: n.data.pointerId,
          internalReferenceId: uuidv1(),
          isOriginallyExport: true,
        },
      };
    } else {
      return n;
    }
  });
  const newValue = _.cloneDeep(value);
  newValue.document.nodes[0].nodes = newNodes;
  return newValue;
}

export class WorkspaceWithRelations {
  public workspace;
  public constructor(workspace: any) {
    this.workspace = workspace;
  }

  // NOTE: There's an open TODO in EpisodeShowPage/index.tsx asking whether
  // the single use of this method is required. If it turns out it's not
  // required, we could remove this method and the methods that support it.
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
              childWorkspace,
            ),
          );
        });
      },
    );

    return relations;
  }
}
