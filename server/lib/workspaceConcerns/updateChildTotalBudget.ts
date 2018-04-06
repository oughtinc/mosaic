import models from "../models";

export class UpdateChildTotalBudget {
    public mutationName = "UpdateChildTotalBudget";
    public childId;
    public totalBudget;

    constructor({ childId, totalBudget }) {
        this.childId = childId;
        this.totalBudget = totalBudget;
    }

    public async run(workspace, event) {
        const child = await models.Workspace.findById(this.childId)
        await workspace.changeAllocationToChild(child, this.totalBudget, {event})
    }

    public toJSON() {
        return {
            mutationName: this.constructor.name,
            childId: this.childId,
            totalBudget: this.totalBudget,
        }
    }
}