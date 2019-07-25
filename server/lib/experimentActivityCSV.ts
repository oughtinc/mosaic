import { print } from "graphql";
import gql from "graphql-tag";
import * as _ from "lodash";
import { Parser } from "json2csv";

let mostRecentId: string;

export async function experimentActivityCSV(server, res, req) {
  let offset = 0;

  if (req.query.recent) {
    const allAssignments = await server.executeOperation({
      query: print(gql`
        query assignments {
          assignments(order: "createdAt", after: "2019-06-16") {
            id
          }
        }
      `),
    });

    const allAssignmentsData =
      allAssignments && allAssignments.data && allAssignments.data.assignments;

    offset = _.findIndex(allAssignmentsData, a => a.id === mostRecentId) + 1;
  }

  const jsonResponse = await server.executeOperation({
    query: print(gql`
      query assignments($offset: Int, $limit: Int) {
        assignments(
          offset: $offset
          limit: $limit
          order: "createdAt"
          after: "2019-06-16"
        ) {
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
    variables: {
      offset: Number(req.query.offset) || offset,
      limit: Number(req.query.limit),
    },
  });

  const data =
    jsonResponse && jsonResponse.data && jsonResponse.data.assignments;

  data.reverse();

  mostRecentId = data[0] && data[0].id;

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
      "Link to Tree": `https://mosaic.ought.org/w/${
        assignment.workspace.rootWorkspace.serialId
      }/compactTree?expanded=true&activeWorkspace=${assignment.workspace.id}`,
    }));

  const parser = new Parser();

  const csv = parser.parse(processedData);

  res.setHeader("Content-Type", "text/csv");
  res.end(csv);
}
