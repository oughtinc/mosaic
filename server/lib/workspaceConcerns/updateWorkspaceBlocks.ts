import models from "../models";

export class UpdateWorkspaceBlocks {
    public static mutationName = "UpdateWorkspaceBlocks";
    public blocks;

    public async initFromNonnormalized({ blocks }, workspace) {
        let _blocks:any = [];

        for (const block of blocks) {
            const relationship = await workspace.blockIdToRelationship(block.id);
            _blocks.push({
                value: block.value,
                relationship
            })
        }
        this.init({blocks:_blocks}, workspace)
    }

    public async init({ blocks }, workspace) {
        this.blocks = blocks;
    }

    public async run(workspace, event) {
        let newBlocks: any = []
        for (const _block of this.blocks) {
            const block = await workspace.relationshipToBlock(_block.relationship)
            await block.update({ value: _block.value }, { event })
            newBlocks = [...newBlocks, block]
        }
        //TODO: Adjust for important children, and parent if that could be the case.
        return {impactedWorkspaces: [workspace]}
    }

    public toJSON() {
        return {
            mutationName: this.constructor.name,
            blocks: this.blocks,
        }
    }
}