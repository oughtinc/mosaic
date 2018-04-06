import models from "../models";
import { AbstractConcern } from "./AbstractConcern";

export class CreateChildWorkspace extends AbstractConcern {
    public static mutationName = "CreateChildWorkspace";

    public async run(){
        const child = await this.workspace.createChild({
            event: this.event,
            question: JSON.parse(this.initInputs.question),
            totalBudget: this.initInputs.totalBudget
        })
        this.impactedWorkspaces = [this.workspace, child];
        return this;
    }
}