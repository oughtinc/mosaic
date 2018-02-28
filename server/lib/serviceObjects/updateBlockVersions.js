class blockUpdateTransaction {
    async constructor(modifiedBlockVersions) {
        this.workspace = workspace
        this.newBlockVersions = newBlockVersions
        this.modifiedExportedPointerIds = []
    }

    run() {
        await this.part1Setup()
        await this.part2UpdateChangedBlocks()
        await this.part3PropagateChangesToDependentBlocks()
    }

    //Top Level Functions
    async part1Setup() {
        await this.gatherImportantStateData()
        await this.createNewTransaction()
    }

    async part2UpdateModifiedBlocks() {
        for (modifiedBlockVersion of modifiedBlockVersions){
            const block = await sequelize.models.Block.getById(modifiedBlockVersion.id)
            const {modifiedExportedPointerIds} = await block.createBlockVersion(modifiedBlockVersion)
            this.modifiedExportedPointerIds = [...this.modifiedExportedPointerIds, ...modifiedExportedPointerIds]
        }
    }

    async part3updateModifiedWorkspaces() {
        const impactedWorkspaces = await getImpactedWorkspaces()
        for (const workspace of impactedWorkspaces){
            await createNewPointersCollection(workspace);
            await createNewWorkspaceImportPointerVersions(workspace);
            await createNewWorkspaceVersion(workspace)
        }
    }

    saveBlockVersions() {
        this.newBlockVersions = await sequelize.models.BlockVersion.create(blockVersionData);
    }

    // Part 1 Functions
    async gatherImportantStateData() {
        let oldBlockVersions = {}
        for (blockVersion of modifiedBlockVersions){
            const block = await sequelize.models.Block.getById(blockVersion.id);
            const version = await block.recentBlockVersion;
        }
        this.oldBlockVersions = oldBlockVersions;
    }

    async createNewTransaction() {
        this.transaction = await sequelize.models.Transaction.create();
    }

    // Part 2 Functions
    async saveBlockVersions(){
        for (blockVersion of modifiedBlockVersions){
        }
    }

    async getImpactedWorkspaces(){
        this.modifiedExportedPointers = importingWorkspaceIds
        let updatedWorkspaceIds = []
        for (const pointerId of this.modifiedExportedPointerIds) {
            const pointer = await sequelize.models.Pointer.findById(pointerId)
            const newUpdatedWorkspaceIds = await pointer.importingWorkspaceIds
            updatedWorkspaceIds = _.uniq([...updatedWorkspaceIds, ...newUpdatedWorkspaceIds])
        }

        let impactedWorkspaces = []
        for (const workspaceId of updatedWorkspaceIds) {
            const workspace = await sequelize.models.Workspace.findById(workspaceId)
            impactedWorkspaces = [...impactedWorkspaces, workspace]
        }
        return impactedWorkspaces
    }

    // Part 3 Functions
}


export {updateBlockVersions}