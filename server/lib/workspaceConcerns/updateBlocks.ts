import models from "../models";

export class UpdateWorkspaceBlocks {
    public mutationName = "UpdateWorkspaceBlocks";
    public blocks;

    public async init({ blocks }, workspace) {
        let _blocks:any = [];

        for (const block of blocks) {
            const relationship = await workspace.blockIdToRelationship(block.id);
            _blocks.push({
                value: block.value,
                relationship
            })
        }
        this.blocks = _blocks;
    }

    public async normalized({ blocks }, workspace) {
        this.blocks = blocks;
    }

    public async run(workspace, event) {
        let newBlocks: any = []
        for (const _block of this.blocks) {
            const block = await workspace.relationshipToBlock(_block.relationship)
            await block.update({ value: _block.value }, { event })
            newBlocks = [...newBlocks, block]
        }
        return newBlocks
    }

    public toJSON() {
        return {
            mutationName: this.constructor.name,
            blocks: this.blocks,
        }
    }
}