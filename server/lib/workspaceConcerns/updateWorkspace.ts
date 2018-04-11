import { AbstractConcern } from "./AbstractConcern";

export class UpdateWorkspace extends AbstractConcern{
    public static mutationName = "UpdateWorkspace";
    public childWorkspaceOrder;

    public async run(){
        const _workspace =  await this.workspace.update({
            childWorkspaceOrder: this.initInputs.childWorkspaceOrder
        }, { event: this.event })
        this.impactedWorkspaces = [this.workspace];
        return this;
    }
}