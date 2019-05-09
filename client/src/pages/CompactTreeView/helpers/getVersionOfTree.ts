export function getVersionOfTree(workspace: { createdAt: string }) {
  if (
    Date.parse(workspace.createdAt) < Date.parse("2019-05-03 18:19:24.777+00")
  ) {
    return "V1";
  }

  return "V2";
}
