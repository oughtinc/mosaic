import models from "../models";
import { UpdateWorkspaceBlocks } from "./updateWorkspaceBlocks";
export class CreateChildWorkspace {
    public static mutationName = "CreateChildWorkspace";
    public question;
    public totalBudget;
    public workspace;
    public event;
    public impactedWorkspaces;

    public async initFromNonnormalized({question, totalBudget}, {workspace, event}) {
        return this.init({question, totalBudget}, {workspace, event})
    }

    public init({question, totalBudget}, {workspace, event}) {
        this.question = question;
        this.totalBudget = totalBudget;
        this.workspace = workspace;
        this.event = event;
        return this;
    }

    public async run(){
        const child = await this.workspace.createChild({
            event: this.event,
            question: JSON.parse(this.question),
            totalBudget: this.totalBudget
        })
        this.impactedWorkspaces = [this.workspace, child];
        return this;
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            initInputs: {
                question: this.question,
                totalBudget: this.totalBudget
            }
        }
    }
}