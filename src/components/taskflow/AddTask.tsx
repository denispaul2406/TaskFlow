"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";

interface AddTaskProps {
  onAddTask: (content: string) => void;
}

export function AddTask({ onAddTask }: AddTaskProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAddTask(content);
      setContent("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
      <Input
        type="text"
        placeholder="Add a new task..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 bg-background"
      />
      <Button type="submit" size="icon" aria-label="Add task">
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
