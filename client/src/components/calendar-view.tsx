import { Calendar } from "./ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { Card, CardContent } from "./ui/card";
import { format } from "date-fns";
import { useState } from "react";

export default function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: events } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const selectedDateEvents = events?.filter(
    (event) =>
      selectedDate &&
      format(new Date(event.startDate), "yyyy-MM-dd") ===
        format(selectedDate, "yyyy-MM-dd")
  );

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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Events for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
        </h2>
        {selectedDateEvents?.map((event) => (
          <Card key={event.id}>
            <CardContent className="p-4">
              <h3 className="font-medium">{event.title}</h3>
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
    </div>
  );
}
