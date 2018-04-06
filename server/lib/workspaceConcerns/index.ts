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