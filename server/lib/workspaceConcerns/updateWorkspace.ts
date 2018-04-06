export class UpdateWorkspace {
    public mutationName = "UpdateWorkspace";
    public childWorkspaceOrder;

    constructor({childWorkspaceOrder}) {
        this.childWorkspaceOrder = childWorkspaceOrder;
    }

    public async run(workspace, event){
        const _workspace =  await workspace.update({
            childWorkspaceOrder: this.childWorkspaceOrder
        }, { event })
        console.log("SHOULD HAVE JUST UPDATED???")
        return workspace;
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            workspaceOrder: this.childWorkspaceOrder,
        }
    }
}