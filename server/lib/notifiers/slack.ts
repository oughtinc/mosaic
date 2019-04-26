import WebClient from "@slack/web-api";

import NotificationRequest from "../models/notificationRequest";

let slackClient;
if (!process.env.SLACK_TOKEN) {
  console.log("SLACK_TOKEN is not set, Slack notifications will not be sent");
} else {
  slackClient = new WebClient(process.env.SLACK_TOKEN);
}

export default async function sendSlackNotification(
  notificationRequest: NotificationRequest,
) {
  if (!process.env.SLACK_TOKEN) {
    return;
  }

  const userResponse = await slackClient.users.lookupByEmail({
    email: notificationRequest.user.email,
  });
  if (!userResponse.ok) {
    // user probably doesn't have a Slack account, or e-mails don't match
    return;
  }

  const imOpenResponse = await slackClient.im.open({
    user: userResponse.user.id,
  });
  if (!imOpenResponse.ok) {
    throw new Error("Unable to open IM to send notification message");
  }

  await slackClient.chat.postMessage({
    channel: imOpenResponse.channel.id,
    text: `Hello, a new workspace in the Mosaic experiment "${
      notificationRequest.experiment.name
    }" is available for you to work on: https://mosaic.ought.org/next?experiment=${
      notificationRequest.experimentId
    }`,
  });
}
