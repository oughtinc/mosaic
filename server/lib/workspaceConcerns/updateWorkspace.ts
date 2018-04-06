export class UpdateWorkspace {
    public static mutationName = "UpdateWorkspace";
    public childWorkspaceOrder;

    public initFromNonnormalized({childWorkspaceOrder}) {
        this.init({childWorkspaceOrder})
    }

    public init({childWorkspaceOrder}) {
        this.childWorkspaceOrder = childWorkspaceOrder
    }

    public async run(workspace, event){
        const _workspace =  await workspace.update({
            childWorkspaceOrder: this.childWorkspaceOrder
        }, { event })
        return {impactedWorkspaces: [workspace]}
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            workspaceOrder: this.childWorkspaceOrder,
        }
    }
}