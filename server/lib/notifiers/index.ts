import NotificationRequest from "../models/notificationRequest";
import sendEmailNotification from "./email";
import sendSlackNotification from "./slack";

async function sendNotifications(notificationRequest: NotificationRequest) {
  try {
    await Promise.all([
      sendEmailNotification(notificationRequest),
      sendSlackNotification(notificationRequest),
    ]);
  } catch (err) {
    console.log("Failed to send notification: " + err);
  }
  await notificationRequest.destroy();
}

export default async function sendPendingNotifications() {
  // Notification system disabled
  // const requestsWithWorkAvailable = await NotificationRequest.findAllWithWorkAvailable();
  // await Promise.all(requestsWithWorkAvailable.map(sendNotifications));
}
