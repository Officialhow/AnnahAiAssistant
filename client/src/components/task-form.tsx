import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { InsertTask } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function TaskForm() {
  const form = useForm<InsertTask>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "personal",
      dueDate: undefined,
    },
  });

  const { toast } = useToast();

  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      form.reset();
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    createTaskMutation.mutate(data);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value).toISOString() : undefined);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || 'personal'}
                      defaultValue="personal"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="work">Work</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button 
              type="submit" 
              disabled={createTaskMutation.isPending}
              className="w-full"
            >
              {createTaskMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Task...
                </>
              ) : (
                'Add Task'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}