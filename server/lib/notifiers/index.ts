import NotificationRequest from "../models/notificationRequest";

if (!process.env.SENDGRID_API_KEY) {
  console.log("SENDGRID_API_KEY is not set, e-mails will not be sent");
}

async function sendEmailNotification(notificationRequest: NotificationRequest) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`DUMMY: Would e-mail ${notificationRequest.user.email} about ${notificationRequest.experiment.name}`);
    return;
  }
  console.log(`E-mailing ${notificationRequest.user.email} about ${notificationRequest.experiment.name}`);
}

async function sendNotifications(notificationRequest: NotificationRequest) {
  await sendEmailNotification(notificationRequest);
  await notificationRequest.destroy();
}

export default async function sendPendingNotifications() {
  const requestsWithWorkAvailable = await NotificationRequest.findAllWithWorkAvailable();
  await Promise.all(requestsWithWorkAvailable.map(sendNotifications));
}
