import models from "../models";

export class UpdateWorkspaceBlocks {
    public mutationName = "UpdateWorkspaceBlocks";
    public blocks;

    constructor({ blocks }) {
        this.blocks = blocks;
    }

    public async run(workspace, event) {
        let newBlocks: any = []
        for (const _block of this.blocks) {
            const block = await models.Block.findById(_block.id)
            await block.update({ ..._block }, { event })
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