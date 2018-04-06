import models from "../models";
import { UpdateWorkspaceBlocks } from "./updateBlocks";
export class CreateChildWorkspace {
    public static mutationName = "CreateChildWorkspace";
    public question;
    public totalBudget;

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
        const hash = await child.toHash();
        const otherMutation = await models.WorkspaceMutation.findAll({
            where: {
                beginningHash: hash
            }
        })
        console.log("CHILD MADE!!!!")
        if (otherMutation.length){
            console.log(111)
            const other = otherMutation[0];
            const mutation = other.mutation;
            console.log(2222, mutation)
            const _mutation = new UpdateWorkspaceBlocks()
            await _mutation.normalized(mutation, workspace)
            console.log(3333)
            const result = _mutation.run(workspace, event)
            console.log("DID THIS DO IT???")
        }
        return child
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            question: this.question,
            totalBudget: this.totalBudget
        }
    }
}