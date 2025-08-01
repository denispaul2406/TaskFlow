"use client";

import type { Task } from "@/types";
import { TaskItem } from "./TaskItem";
import { AnimatePresence, motion } from "framer-motion";

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updatedValues: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, onUpdateTask, onDeleteTask }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {tasks.map((task) => (
           <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
          >
            <TaskItem
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
