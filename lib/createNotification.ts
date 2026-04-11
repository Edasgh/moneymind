import Notification from "@/models/Notification";

export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata = {},
}: any) {
  await Notification.create({
    userId,
    type,
    title,
    message,
    metadata,
  });
}
