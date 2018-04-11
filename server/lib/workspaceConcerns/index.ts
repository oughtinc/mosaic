import { UpdateWorkspaceBlocks } from "./UpdateWorkspaceBlocks";
import { UpdateChildTotalBudget } from "./UpdateChildTotalBudget";
import { UpdateWorkspace } from "./UpdateWorkspace";
import { CreateChildWorkspace } from "./CreateChildWorkspace";
import _ = require("lodash");

export const concerns = [
    UpdateWorkspaceBlocks,
    UpdateWorkspace,
    UpdateChildTotalBudget,
    CreateChildWorkspace,
]

export function concernFromJSON(mutationJson:any){
    const concern:any = _.keyBy(concerns, 'mutationName')[mutationJson.mutationName]
    return new concern()
}

export async function runMutationFromJson(mutationJson:any, {workspace, event}){
    const mutation:any = concernFromJSON(mutationJson);
    await mutation
        .init(mutationJson.initInputs, {workspace, event})
    await mutation.run()
    return mutation
}