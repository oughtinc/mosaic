import { UpdateWorkspaceBlocks } from "./updateWorkspaceBlocks";
import { UpdateChildTotalBudget } from "./updateChildTotalBudget";
import { UpdateWorkspace } from "./updateWorkspace";
import { CreateChildWorkspace } from "./createChildWorkspace";
import models from "../models";

export const concerns = [
    UpdateWorkspaceBlocks,
    UpdateWorkspace,
    UpdateChildTotalBudget,
    CreateChildWorkspace,
]

export function concernFromJSON(mutationJson:any){
    const concern:any = concerns.find((c:any) => c.mutationName === mutationJson.mutationName)
    return new concern();
}

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
        await this.mutation.initFromNonnormalized(this.mutationParams, this.workspace)
        this.impactedWorkspaces = await this.mutation.run(this.workspace, this.event)
    }

    private async step3ConsiderAddToCache(){
        const endingHash = await this.workspace.toHash()
        await models.CachedWorkspaceMutation.create({
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