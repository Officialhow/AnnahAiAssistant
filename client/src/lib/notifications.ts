export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
}

export function checkUpcomingTasks(tasks: Array<{ title: string; dueDate: string | null }>) {
  const now = new Date();
  const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60000);

  tasks.forEach(task => {
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      if (dueDate > now && dueDate <= thirtyMinutesFromNow) {
        showNotification(`Task Due Soon: ${task.title}`, {
          body: `Your task "${task.title}" is due in less than 30 minutes`,
          icon: "/favicon.ico",
        });
      }
    }
  });
}
