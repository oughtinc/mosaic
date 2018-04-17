import models from "../models";

export class WorkspaceMutation {
    private workspaceId;
    private mutation;
    private mutationParams;
    private beginningRemainingBudget;
    private event;
    private workspace;
    private beginningHash;
    private impactedWorkspaces;

    constructor({workspaceId, mutationClass, params}){
        this.workspaceId = workspaceId;
        this.mutation = new mutationClass();
        this.mutationParams = params;
    }

    public async run(){
        await this.step1BeforeMutation()
        await this.step2Mutation()
        await this.step3ConsiderAddToCache()
        await this.step4FastForward()
        return this.workspace
    }

    private async step1BeforeMutation(){
        this.event = await models.Event.create()
        this.workspace = await models.Workspace.findById(this.workspaceId)
        this.beginningHash = await this.workspace.toHash()
        this.beginningRemainingBudget = this.workspace.remainingBudget;
    }

    private async step2Mutation(){
        const mutation = await this.mutation
            .initFromUnnormalized(this.mutationParams, {workspace: this.workspace, event: this.event})
        await mutation.run()
        this.impactedWorkspaces = mutation.impactedWorkspaces;
    }

    private async step3ConsiderAddToCache(){
        const endingHash = await this.workspace.toHash()
        await models.CachedWorkspaceMutation.registerNewEntry({
            beginningHash: this.beginningHash,
            beginningRemainingBudget: this.workspace.remainingBudget,
            endingHash,
            mutation: this.mutation.toJSON()
        })
    }

    private async step4FastForward(){
        for (const w of this.impactedWorkspaces){
            await w.fastForwardMutations(this.event);
        }
    }
}