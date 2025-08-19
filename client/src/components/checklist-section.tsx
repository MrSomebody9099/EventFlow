import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, CheckSquare, Square, Check, X, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema, type Task } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { z } from "zod";

type TaskFormData = z.infer<typeof insertTaskSchema>;

interface ChecklistSectionProps {
  userId: string;
}

export default function ChecklistSection({ userId }: ChecklistSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/users", userId, "tasks"],
  });

  const form = useForm<TaskFormData>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      userId,
      description: "",
      completed: false,
      priority: "medium",
      dueDate: "",
    },
  });

  const addTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "tasks"] });
      setIsModalOpen(false);
      form.reset({ userId, description: "", completed: false, priority: "medium", dueDate: "" });
      toast({
        title: "Task added",
        description: "Your task has been added to the checklist.",
      });
    },
    onError: () => {
      toast({
        title: "Error adding task",
        description: "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task> & { id: string }) => {
      const { id, ...rest } = data;
      const response = await apiRequest("PUT", `/api/tasks/${id}`, rest);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "tasks"] });
    },
  });

  const onSubmit = (data: TaskFormData) => {
    addTaskMutation.mutate(data);
  };

  const handleTaskToggle = (taskId: string, completed: boolean) => {
    updateTaskMutation.mutate({ id: taskId, completed });
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="font-script text-lg text-charcoal">Loading tasks...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-script text-2xl text-charcoal flex items-center">
            <CheckSquare className="text-rose-dusty mr-3" />
            Checklist
          </h2>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-rose-soft text-white px-3 py-1 rounded-lg font-script text-sm hover:bg-rose-dusty transition-colors"
                data-testid="button-add-task"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-script text-2xl text-charcoal">Add New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-testid="form-add-task">
                <div>
                  <Label className="font-script text-lg text-charcoal">Task Description</Label>
                  <Input
                    {...form.register("description")}
                    placeholder="e.g., Book venue"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-task-description"
                  />
                  {form.formState.errors.description && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>
                <div>
                  <Label className="font-script text-lg text-charcoal">Due Date (Optional)</Label>
                  <Input
                    {...form.register("dueDate")}
                    type="date"
                    className="mt-2 p-3 border-2 border-rose-soft rounded-xl focus:border-rose-dusty font-script"
                    data-testid="input-task-due-date"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    variant="outline"
                    className="flex-1 font-script"
                    data-testid="button-cancel-task"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addTaskMutation.isPending}
                    className="flex-1 bg-rose-soft text-white font-script hover:bg-rose-dusty transition-colors"
                    data-testid="button-submit-task"
                  >
                    {addTaskMutation.isPending ? "Adding..." : "Add Task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Progress */}
        <div className="bg-beige rounded-lg p-3 mb-4 text-center">
          <div className="font-script text-lg text-gray-600">Progress</div>
          <div className="text-xl font-semibold text-charcoal" data-testid="text-task-progress">
            {completedTasks}/{totalTasks}
          </div>
          {totalTasks > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-sage h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              ></div>
            </div>
          )}
        </div>
        
        <div className="space-y-2 max-h-64 overflow-y-auto" data-testid="list-tasks">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-script text-lg">No tasks added yet</p>
              <p className="text-sm">Add your first task to start organizing your to-do list</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskRow key={task.id} task={task} onToggle={handleTaskToggle} onUpdated={() => queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "tasks"] })} />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function TaskRow({ task, onToggle, onUpdated }: { task: Task; onToggle: (id: string, completed: boolean) => void; onUpdated: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof insertTaskSchema>>({
    resolver: zodResolver(insertTaskSchema.partial()),
    defaultValues: {
      userId: task.userId,
      description: task.description,
      completed: task.completed,
      priority: task.priority ?? "medium",
      dueDate: task.dueDate ?? "",
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const res = await apiRequest("PUT", `/api/tasks/${task.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      onUpdated();
      setIsEditing(false);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/tasks/${task.id}`);
    },
    onSuccess: () => {
      onUpdated();
    },
  });

  if (!isEditing) {
    return (
      <div className="flex items-center space-x-3 p-2 hover:bg-beige rounded transition-colors">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
          className="w-4 h-4"
          data-testid={`checkbox-task-${task.id}`}
        />
        <span 
          className={`font-script flex-1 ${
            task.completed ? 'line-through opacity-50 text-gray-500' : 'text-charcoal'
          }`}
        >
          {task.description}
        </span>
        {task.dueDate && (
          <span className="text-xs text-gray-500">
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        <Button size="icon" variant="outline" onClick={() => setIsEditing(true)} aria-label="Edit task">
          <Pencil className="w-4 h-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate()} aria-label="Delete task">
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="flex items-center gap-2 p-2 bg-beige rounded">
      <Input {...form.register("description")} className="h-8 flex-1" />
      <Input {...form.register("dueDate")} type="date" className="h-8" />
      <div className="flex gap-2">
        <Button size="sm" type="submit">Save</Button>
        <Button size="sm" variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
      </div>
    </form>
  );
}
