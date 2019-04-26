import NotificationRequest from "../models/notificationRequest";
import sendEmailNotification from "./email";

async function sendNotifications(notificationRequest: NotificationRequest) {
  await sendEmailNotification(notificationRequest);
  await notificationRequest.destroy();
}

export default async function sendPendingNotifications() {
  const requestsWithWorkAvailable = await NotificationRequest.findAllWithWorkAvailable();
  await Promise.all(requestsWithWorkAvailable.map(sendNotifications));
}
