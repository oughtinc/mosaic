import * as SendGrid from "@sendgrid/mail";

import NotificationRequest from "../models/notificationRequest";

if (!process.env.SENDGRID_API_KEY) {
  console.log("SENDGRID_API_KEY is not set, e-mails will not be sent");
} else {
  SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
}

export default async function sendEmailNotification(notificationRequest: NotificationRequest) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`DUMMY: Would e-mail ${notificationRequest.user.email} about ${notificationRequest.experiment.name}`);
    return;
  }

  await SendGrid.send({
    to: {
      name: `${notificationRequest.user.givenName} ${notificationRequest.user.familyName}`,
      email: notificationRequest.user.email,
    },
    from: "Mosaic <mosaic@ought.org>",
    subject: "A new Mosaic workspace is available",
    text: `A new workspace is available in the experiment "${notificationRequest.experiment.name}" which you can work on.

To continue taking part in the experiment, please visit:
https://mosaic.ought.org/next?experiment=${notificationRequest.experimentId}

Please be aware that you may find another user completes that workspace before
you visit the link, so you may find no workspaces available for you. If this
happens, you can re-register to receive another notification. You will not
receive any further notifications unless you re-register.`
  });
}
