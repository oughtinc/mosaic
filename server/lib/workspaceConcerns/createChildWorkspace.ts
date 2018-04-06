import models from "../models";
import { UpdateWorkspaceBlocks } from "./updateWorkspaceBlocks";
export class CreateChildWorkspace {
    public static mutationName = "CreateChildWorkspace";
    public question;
    public totalBudget;

    public async initFromNonnormalized({question, totalBudget}) {
        this.init({question, totalBudget})
    }

    public init({question, totalBudget}) {
        this.question = question;
        this.totalBudget = totalBudget;
    }

    public async run(workspace, event){
        const child = await workspace.createChild({
            event,
            question: JSON.parse(this.question),
            totalBudget: this.totalBudget
        })
        return {impactedWorkspaces: [workspace, child]}
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            question: this.question,
            totalBudget: this.totalBudget
        }
    }
}