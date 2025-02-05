import { Calendar } from "./ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { Event, Task } from "@shared/schema";
import { Card, CardContent, CardHeader } from "./ui/card";
import { format } from "date-fns";
import { useState } from "react";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const selectedDateEvents = events?.filter(
    (event) =>
      selectedDate &&
      format(new Date(event.startDate), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
  );

  const selectedDateTasks = tasks?.filter(
    (task) =>
      selectedDate &&
      task.dueDate &&
      format(new Date(task.dueDate), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
  );

  const toggleTask = async (taskId: number) => {
    await apiRequest("PATCH", `/api/tasks/${taskId}/complete`);
    queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
  };

  return (
    <div className="grid md:grid-cols-[300px,1fr] gap-8">
      <Card>
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">
          Activities for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
        </h2>

        {selectedDateTasks && selectedDateTasks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Tasks Due</h3>
            {selectedDateTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={task.completed || false}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <div className="flex-1">
                      <h4 className={`font-medium ${task.completed ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    {task.category && (
                      <Badge>{task.category}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedDateEvents && selectedDateEvents.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Events</h3>
            {selectedDateEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <h4 className="font-medium">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                  <div className="text-sm text-muted-foreground mt-2">
                    {format(new Date(event.startDate), "h:mm a")} -{" "}
                    {format(new Date(event.endDate), "h:mm a")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!selectedDateTasks?.length && !selectedDateEvents?.length) && (
          <p className="text-muted-foreground">
            No tasks or events scheduled for this day
          </p>
        )}
      </div>
    </div>
  );
}