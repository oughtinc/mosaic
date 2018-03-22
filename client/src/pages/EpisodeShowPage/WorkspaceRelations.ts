import _ = require("lodash");
import * as uuidv1 from "uuid/v1";

export enum WorkspaceRelationTypes {
    WorkspaceQuestion = 0,
    WorkspaceScratchpad,
    WorkspaceAnswer,
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

function outputsToInputs(value: any) {
    const nodes = value.document.nodes[0].nodes;
    const newNodes = nodes.map((n) => {
        if (n.type && n.type === "pointerExport") {
            return ({
                object: "inline",
                type: "pointerImport",
                isVoid: true,
                data: {
                    pointerId: n.data.pointerId,
                    internalReferenceId: uuidv1(),
                },
            });
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

    public allReadOnlyBlocks() {
        return this.allReadOnlyBlockRelationships().map((b) => b.findBlock());
    }

    private allReadOnlyBlockRelationships() {
        const isReadOnly = (relationship) => (relationship.relationTypeAttributes().permission === Permissions.ReadOnly);
        return this.allTouchingBlockRelationships().filter(isReadOnly);
    }

    private allTouchingBlockRelationships() {
        const relations: any = [];
        const inWorkspace = _.filter(RelationTypeAttributes, {source: WORKSPACE})
            .forEach((RelationTypeAttribute) => relations.push(new WorkspaceBlockRelation(RelationTypeAttribute.name, this.workspace)) );

        const outsideWorkspace = _.filter(RelationTypeAttributes, {source: SUBWORKSPACE})
        .forEach((RelationTypeAttribute) => {
            this.workspace.childWorkspaces.forEach((childWorkspace) => {
                relations.push(new WorkspaceBlockRelation(RelationTypeAttribute.name, childWorkspace));
            });
        });

        return relations;
    }
}

export class WorkspaceBlockRelation {
    public workspace;
    public workspaceRelationType;

    public constructor(workspaceRelationType: WorkspaceRelationTypes, workspace: any) {
        this.workspace = workspace;
        this.workspaceRelationType = workspaceRelationType;
    }

    public blockEditorAttributes() {
        const {blockType, permission} = this.relationTypeAttributes();
        const block: any = this.findBlock();
        const isReadOnly = permission === Permissions.ReadOnly;
        const { value, id } = block;
        return {
            name: id,
            blockId: id,
            readOnly: isReadOnly,
            initialValue: isReadOnly ? (value && outputsToInputs(value) || false) : value,
            shouldAutosave: !isReadOnly,
        };
    }

    public findBlock() {
        const {blockType} = this.relationTypeAttributes();
        return this.workspace.blocks.find((b) => b.type === blockType);
    }

    public relationTypeAttributes() {
        return _.keyBy(RelationTypeAttributes, "name")[this.workspaceRelationType];
    }
}