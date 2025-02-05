import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";

export default function TaskList() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const toggleTask = async (taskId: number) => {
    await apiRequest("PATCH", `/api/tasks/${taskId}/complete`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks?.map((task) => (
        <Card key={task.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <Checkbox
              checked={task.completed}
              onCheckedChange={() => toggleTask(task.id)}
            />
            <div className="flex-1">
              <h3 className={`font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground">{task.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge>{task.category}</Badge>
              {task.dueDate && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
