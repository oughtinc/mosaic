export default function sortWorkspacesByCreatedAt(workspaces) {
  return workspaces.concat().sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}
