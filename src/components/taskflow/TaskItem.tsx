"use client";

import type { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  CalendarDays,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { format, parseISO } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (taskId: string, updatedValues: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskItem({ task, onUpdateTask, onDeleteTask }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(task.content);

  const handleEditSubmit = () => {
    onUpdateTask(task.id, { content: editedContent });
    setIsEditing(false);
  };
  
  const priorityVariant = {
    High: "destructive",
    Medium: "secondary",
    Low: "outline",
  } as const;

  return (
    <>
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-all group">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.status === "Done"}
          onCheckedChange={(checked) =>
            onUpdateTask(task.id, { status: checked ? "Done" : "To Do" })
          }
          className="transition-transform duration-300 ease-in-out group-hover:scale-110"
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`flex-1 text-sm cursor-pointer ${
            task.status === "Done" ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.content}
        </label>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {task.dueDate && (
             <Badge variant="outline" className="flex items-center gap-1 font-normal">
              <CalendarDays className="h-3 w-3" />
              {format(parseISO(task.dueDate), 'MMM d')}
            </Badge>
          )}
          {task.priority && (
            <Badge variant={priorityVariant[task.priority]}>
              {task.priority}
            </Badge>
          )}
           <Button variant="ghost" size="icon" className="h-7 w-7">
              <MessageCircle className="h-4 w-4" />
           </Button>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
             <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Flag className="mr-2 h-4 w-4" />
                <span>Priority</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={task.priority} onValueChange={(p) => onUpdateTask(task.id, { priority: p as Task['priority']})}>
                  <DropdownMenuLabel>Set Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioItem value="High">High</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Medium">Medium</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="Low">Low</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteTask(task.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="my-4"
            rows={4}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setEditedContent(task.content)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditSubmit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
