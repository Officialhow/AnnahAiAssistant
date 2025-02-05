import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import TaskList from "@/components/task-list";
import CalendarView from "@/components/calendar-view";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskForm from "@/components/task-form";
import { useWebSocket } from "@/lib/websocket";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { requestNotificationPermission, showNotification } from "@/lib/notifications";
import { Task } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const socket = useWebSocket();

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          toast({
            title: "New Notification",
            description: data.message,
          });

          if (data.showBrowserNotification) {
            showNotification("Task Reminder", {
              body: data.message,
              icon: "/favicon.ico",
            });
          }
        }
      };
    }
  }, [socket, toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Annah</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid gap-8">
          <TaskForm />

          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks">
              <TaskList />
            </TabsContent>

            <TabsContent value="calendar">
              <CalendarView />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}