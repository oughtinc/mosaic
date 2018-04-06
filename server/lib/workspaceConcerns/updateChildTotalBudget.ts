import models from "../models";

export class UpdateChildTotalBudget {
    public static mutationName = "UpdateChildTotalBudget";
    public childId;
    public totalBudget;

    public async initFromNonnormalized({ childId, totalBudget }) {
        this.init({ childId, totalBudget })
    }

    public init({ childId, totalBudget }) {
        this.childId = childId
        this.totalBudget = totalBudget
    }

    public async run(workspace, event) {
        const child = await models.Workspace.findById(this.childId)
        await workspace.changeAllocationToChild(child, this.totalBudget, {event})
        return {impactedWorkspaces: [workspace, child]}
    }

    public toJSON() {
        return {
            mutationName: this.constructor.name,
            childId: this.childId,
            totalBudget: this.totalBudget,
        }
    }
}