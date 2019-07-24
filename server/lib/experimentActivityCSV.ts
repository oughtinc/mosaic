import { print } from "graphql";
import gql from "graphql-tag";
import { Parser } from "json2csv";
import { assign } from "apollo-utilities";

export async function experimentActivityCSV(server, res) {
  const jsonResponse = await server.executeOperation({
    query: print(gql`
      query assignments {
        assignments(limit: 200, order: "reverse:createdAt") {
          id
          createdAt
          startAtTimestamp
          endAtTimestamp
          user {
            id
            email
          }
          workspace {
            id
            serialId
            rootWorkspace {
              id
              serialId
            }
            isEligibleForHonestOracle
            isEligibleForMaliciousOracle
            hasBeenSelectedByJudge
            hasSelectedHonestAnswer
            hasDeclinedToChallenge
            hasBeenSelectedBecauseMaliciousDeclined
          }
          experiment {
            id
            name
          }
        }
      }
    `),
  });

  const data =
    jsonResponse && jsonResponse.data && jsonResponse.data.assignments;

  const processedData =
    data &&
    data.map(assignment => ({
      "User Email": assignment.user.email,
      "Assignment Started": assignment.createdAt,
      "Experiment Name": assignment.experiment.name,
      "Workspace Id": assignment.workspace.serialId,
      "Rootworkspace Id": assignment.workspace.rootWorkspace.serialId,
      "Selected By Judge": assignment.workspace.hasBeenSelectedByJudge,
      "Declined To Challenge": assignment.workspace.hasDeclinedToChallenge,
      "Selected Because Malicious Declined":
        assignment.workspace.hasBeenSelectedBecauseMaliciousDeclined,
      "Picked Honest Answer": assignment.workspace.hasSelectedHonestAnswer,
      Duration:
        Math.round(
          ((assignment.endAtTimestamp - assignment.startAtTimestamp) /
            1000 /
            60) *
            100,
        ) / 100, // minutes w/ 2 decimal places
      "Workspace Type": assignment.workspace.isEligibleForHonestOracle
        ? "HONEST"
        : assignment.workspace.isEligibleForMaliciousOracle
        ? "MALICIOUS"
        : "JUDGE",
      "Link To History": `https://mosaic.ought.org/snapshots/${
        assignment.workspace.serialId
      }`,
      "Link to Tree": `https://mosaic.ought.org/compactTree/${
        assignment.workspace.rootWorkspace.serialId
      }/expanded=true&activeWorkspace=${assignment.workspace.id}`,
    }));

  const parser = new Parser();

  const csv = parser.parse(processedData);

  res.setHeader("Content-Type", "text/csv");
  res.end(csv);
}
