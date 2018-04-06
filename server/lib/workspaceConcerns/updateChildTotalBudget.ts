import models from "../models";

export class UpdateChildTotalBudget {
    public static mutationName = "UpdateChildTotalBudget";
    public childId;
    public totalBudget;
    public workspace;
    public event;
    public impactedWorkspaces;

    public async initFromNonnormalized({ childId, totalBudget }, {workspace, event}) {
        return this.init({ childId, totalBudget }, {workspace, event})
    }

    public init({ childId, totalBudget }, {workspace, event}) {
        this.childId = childId
        this.totalBudget = totalBudget
        this.workspace = workspace
        this.event = event
        return this
    }

    public async run() {
        const child = await models.Workspace.findById(this.childId)
        await this.workspace.changeAllocationToChild(child, this.totalBudget, {event: this.event})
        this.impactedWorkspaces = [this.workspace, child]
        return this
    }

    public toJSON() {
        return {
            mutationName: this.constructor.name,
            initInputs: {
                childId: this.childId,
                totalBudget: this.totalBudget,
            }
        }
    }
}