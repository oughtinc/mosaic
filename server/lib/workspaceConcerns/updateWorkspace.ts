export class UpdateWorkspace {
    public static mutationName = "UpdateWorkspace";
    public childWorkspaceOrder;
    public workspace;
    public event;
    public impactedWorkspaces;

    public initFromNonnormalized({childWorkspaceOrder}, {workspace, event}) {
        return this.init({childWorkspaceOrder}, {workspace, event})
    }

    public init({childWorkspaceOrder}, {workspace, event}) {
        this.childWorkspaceOrder = childWorkspaceOrder
        this.workspace = workspace
        this.event = event
        return this
    }

    public async run(){
        const _workspace =  await this.workspace.update({
            childWorkspaceOrder: this.childWorkspaceOrder
        }, { event: this.event })
        this.impactedWorkspaces = [this.workspace];
        return this;
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            initInputs: {
                workspaceOrder: this.childWorkspaceOrder,
            }
        }
    }
}