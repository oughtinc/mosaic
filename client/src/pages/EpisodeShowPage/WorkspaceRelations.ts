import _ = require("lodash");
import * as uuidv1 from "uuid/v1";

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

export class WorkspaceBlockRelation {
    public type;
    public permission;

    public constructor(type: string, permission: Permissions) {
        this.type = type;
        this.permission = permission;
    }

    public blockEditorAttributes(workspaceWithBlock: any) {
        const block: any = this.blockSelector(workspaceWithBlock);
        const isReadOnly = this.permission === Permissions.ReadOnly;
        const { value, id } = block;
        return {
            name: id,
            blockId: id,
            readOnly: isReadOnly,
            initialValue: isReadOnly ? (value && outputsToInputs(value) || false) : value,
            autoSave: !isReadOnly,
        };
    }

    private blockSelector(workspaceWithBlock: any) {
        return workspaceWithBlock.blocks.find((b) => b.type === this.type);
    }

}

export const WorkspaceRelations = {
    [WorkspaceRelationTypes.WorkspaceQuestion]: new WorkspaceBlockRelation(QUESTION, Permissions.ReadOnly),
    [WorkspaceRelationTypes.WorkspaceScratchpad]: new WorkspaceBlockRelation(SCRATCHPAD, Permissions.Editable),
    [WorkspaceRelationTypes.WorkspaceAnswer]: new WorkspaceBlockRelation(ANSWER, Permissions.Editable),
    [WorkspaceRelationTypes.SubworkspaceQuestion]: new WorkspaceBlockRelation(QUESTION, Permissions.Editable),
    [WorkspaceRelationTypes.SubworkspaceAnswer]: new WorkspaceBlockRelation(ANSWER, Permissions.ReadOnly),
};