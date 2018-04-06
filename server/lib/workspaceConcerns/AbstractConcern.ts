export class AbstractConcern {
    public static mutationName = "AbstractConcern";
    public workspace;
    public event;
    public impactedWorkspaces;
    public initInputs;

    public async initFromNonnormalized(params, {workspace, event}) {
        return this.init(params, {workspace, event})
    }

    public init(initInputs, {workspace, event}) {
        this.initInputs = initInputs;
        this.workspace = workspace;
        this.event = event;
        return this;
    }

    public async run(){
        return this;
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            initInputs: this.initInputs
        }
    }
}