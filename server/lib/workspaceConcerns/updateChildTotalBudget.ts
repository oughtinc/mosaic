import models from "../models";
import { AbstractConcern } from "./AbstractConcern";

export class UpdateChildTotalBudget extends AbstractConcern {
    public static mutationName = "UpdateChildTotalBudget";

    public async run() {
        const {childId, totalBudget} = this.initInputs
        const child = await models.Workspace.findById(childId)
        await this.workspace.changeAllocationToChild(child, totalBudget, {event: this.event})
        this.impactedWorkspaces = [this.workspace, child]
        return this
    }
}