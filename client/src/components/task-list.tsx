import { useQuery } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { Card, CardContent } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { Badge } from "./ui/badge";
import { Loader2, Search, SortAsc, SortDesc } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type SortField = "dueDate" | "title" | "category";
type SortOrder = "asc" | "desc";

export default function TaskList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          (task.category?.toLowerCase() || '').includes(query)
      );
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "dueDate":
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
          comparison = aDate - bDate;
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "category":
          const aCategory = a.category || '';
          const bCategory = b.category || '';
          comparison = aCategory.localeCompare(bCategory);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [tasks, searchQuery, sortField, sortOrder]);

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
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              Sort by {sortField}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSortField("dueDate")}>
              Due Date
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("title")}>
              Title
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortField("category")}>
              Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}>
              Toggle Order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredAndSortedTasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <Checkbox
              checked={task.completed || false}
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
              {task.category && <Badge>{task.category}</Badge>}
              {task.dueDate && (
                <span className="text-sm text-muted-foreground">
                  {format(new Date(task.dueDate), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          {searchQuery ? "No tasks match your search" : "No tasks yet"}
        </div>
      )}
    </div>
  );
}