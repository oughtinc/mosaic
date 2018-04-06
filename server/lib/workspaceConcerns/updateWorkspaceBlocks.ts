import models from "../models";

export async function normalizeBlock(block, workspace){
    const relationship = await workspace.blockIdToRelationship(block.id);
    return ({
        value: block.value,
        relationship
    })
}

export class UpdateWorkspaceBlocks {
    public static mutationName = "UpdateWorkspaceBlocks";
    public blocks;
    public workspace;
    public event;
    public impactedWorkspaces;

    public async initFromNonnormalized({ blocks }, {workspace, event}) {
        let normalizedBlocks:any = [];

        for (const block of blocks) {
            const normalizedBlock = await normalizeBlock(block, workspace)
            normalizedBlocks.push(normalizedBlock)
        }

        return this.init({blocks: normalizedBlocks}, {workspace, event})
    }

    public async init({ blocks }, {workspace, event}) {
        this.blocks = blocks;
        this.workspace = workspace;
        this.event = event;
        return this;
    }

    public async run() {
        let newBlocks: any = []
        for (const _block of this.blocks) {
            const block = await this.workspace.relationshipToBlock(_block.relationship)
            await block.update({ value: _block.value }, { event: this.event })
            newBlocks = [...newBlocks, block]
        }
        //TODO: Adjust for important children, and parent if that could be the case.
        this.impactedWorkspaces = [this.workspace];
        return this;
    }

    public toJSON() {
        return {
            mutationName: this.constructor.name,
            initInputs: {
                blocks: this.blocks,
            }
        }
    }
}