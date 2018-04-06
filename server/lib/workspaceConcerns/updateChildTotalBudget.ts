import models from "../models";
import { AbstractConcern } from "./AbstractConcern";

export class UpdateChildTotalBudget extends AbstractConcern {
    public static mutationName = "UpdateChildTotalBudget";

    public async initFromNonnormalized({childId, totalBudget}, {workspace, event}) {
        const childIndex = await workspace.childIdToChildIndex(childId);
        return this.init({childIndex, totalBudget}, {workspace, event})
    }

    public async run() {
        const {childIndex, totalBudget} = this.initInputs
        const childId = this.workspace.childIndexToChildId(childIndex)
        const child = await models.Workspace.findById(childId);
        await this.workspace.changeAllocationToChild(child, totalBudget, {event: this.event})
        this.impactedWorkspaces = [this.workspace, child]
        return this
    }
}