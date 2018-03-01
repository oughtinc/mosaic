class BlockUpdateTransaction {
    async constructor(modifiedBlockVersionInputs) {
        this.workspace = workspace
        this.modifiedBlockVersionInputs = modifiedBlockVersionInputs
        this.modifiedExportedPointerIds = []
        this.transaction = null
        this.oldBlockVersions = []
        this.newBlockVersions = []
    }

    run() {
        await this.part1Setup()
        await this.part2UpdateModifiedBlocks()
        await this.part3CreateNewWorkspaceVersionWithModifiedBlocks()
        await this.part4PropagateChangesToImpactedWorkspaces()
        //TODO: Make sure a workspace is created that associates these blocks together!
    }

    //Top Level Functions
    async part1Setup() {
        // await this.gatherImportantStateData() May not be needed
        await this.createNewTransaction()
    }

    async part2UpdateModifiedBlocks() {
        for (modifiedBlockVersionInputs of this.modifiedBlockVersionInputs) {
            const block = await sequelize.models.Block.findById(modifiedBlockVersionInputs.id)
            const oldBlockVersion = await block.recentBlockVersion()
            const newBlockVersion = await block.createBlockVersion(modifiedBlockVersion)
            const updatedExportedPointerVersions = newBlockVersion.cachedExportPointerValuesDifference(oldBlockVersion)
            this.newBlockVersions = [...this.newBlockVersions, newBlockVersion]
            this.updatedExportedPointerVersions = [...this.updatedExportedPointerVersions, ...updatedExportedPointerVersions]
        }
    }

    async part3CreateNewWorkspaceVersionWithModifiedBlocks() {
    }

    async part4PropagateChangesToImpactedWorkspaces() {
        const impactedWorkspaces = await getImpactedWorkspaces()
        for (const workspace of impactedWorkspaces) {
            const workspaceVersion = await workspace.recentWorkspaceVersion()
            await sequelize.models.WorkspaceVersion.createWithExportedPointerVersions(
                workspaceVersion,
                this.transaction,
                this.updatedExportedPointerVersions
            )
        }
    }

    // Part 1 Functions
    async gatherImportantStateData() {
        let oldBlockVersions = []
        for (blockVersionInput of this.modifiedBlockVersionInputs) {
            const block = await sequelize.models.Block.findById(blockVersionInput.blockId);
            const version = await block.recentBlockVersion();
            oldBlockVersions = [...oldBlockVersions, version]
        }
        this.oldBlockVersions = oldBlockVersions;
    }

    async createNewTransaction() {
        this.transaction = await sequelize.models.Transaction.create();
    }

    async getImpactedWorkspaces() {
        this.modifiedExportedPointers = importingWorkspaceIds
        let impactedWorkspaces = []
        for (const pointerVersion of this.updatedExportedPointerVersions) {
            const pointer = await sequelize.models.Pointer.findById(pointerVersion.pointerId)
            const _impactedWorkspaces = await pointer.importingWorkspaces()
            impactedWorkspaces = [...impactedWorkspaces, ..._impactedWorkspaces]
        }
        impactedWorkspaces = _.uniqBy(impactedWorkspaces, w => w.id)
        return impactedWorkspaces
    }
}


export {updateBlockVersions}