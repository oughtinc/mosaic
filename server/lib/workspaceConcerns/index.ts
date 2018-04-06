import { UpdateWorkspaceBlocks } from "./UpdateWorkspaceBlocks";
import { UpdateChildTotalBudget } from "./UpdateChildTotalBudget";
import { UpdateWorkspace } from "./UpdateWorkspace";
import { CreateChildWorkspace } from "./CreateChildWorkspace";

export const concerns = [
    UpdateWorkspaceBlocks,
    UpdateWorkspace,
    UpdateChildTotalBudget,
    CreateChildWorkspace,
]

export function concernFromJSON(mutationJson:any){
    const concern:any = concerns.find((c:any) => c.mutationName === mutationJson.mutationName)
    return new concern();
}

export async function runMutationFromJson(mutationJson:any, {workspace, event}){
    const mutation:any = concernFromJSON(mutationJson);
    await mutation
        .initFromNonnormalized(mutationJson.initInputs, {workspace, event})
    await mutation.run()
    return mutation
}