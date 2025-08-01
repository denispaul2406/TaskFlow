
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { StatusUpdate, Task, User } from "@/types";
import { Calendar, Clock, User as UserIcon, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface StatusUpdateProps {
  projectId: string;
  tasks: Task[];
  members: User[];
  currentUser: User;
}

export function StatusUpdate({ projectId, tasks, members, currentUser }: StatusUpdateProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState<'daily' | 'weekly' | 'milestone'>('daily');
  const [tasksCompleted, setTasksCompleted] = useState<string[]>([]);
  const [tasksInProgress, setTasksInProgress] = useState<string[]>([]);
  const [blockers, setBlockers] = useState("");
  const [nextSteps, setNextSteps] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        variant: "destructive",
        title: "Content Required",
        description: "Please provide an update content.",
      });
      return;
    }

    try {
      const statusUpdate: Omit<StatusUpdate, 'id'> = {
        projectId,
        author: currentUser,
        content,
        type,
        createdAt: serverTimestamp(),
        tasksCompleted,
        tasksInProgress,
        blockers: blockers ? blockers.split('\n').filter(b => b.trim()) : [],
        nextSteps: nextSteps ? nextSteps.split('\n').filter(n => n.trim()) : [],
      };

      await addDoc(collection(db, `projects/${projectId}/statusUpdates`), statusUpdate);

      toast({
        title: "Status Update Posted",
        description: "Your update has been shared with the team.",
      });

      setIsModalOpen(false);
      setContent("");
      setTasksCompleted([]);
      setTasksInProgress([]);
      setBlockers("");
      setNextSteps("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to post status update. Please try again.",
      });
    }
  };

  const toggleTaskCompleted = (taskId: string) => {
    setTasksCompleted(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleTaskInProgress = (taskId: string) => {
    setTasksInProgress(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const availableTasks = tasks.filter(task => 
    !tasksCompleted.includes(task.id) && !tasksInProgress.includes(task.id)
  );

  return (
    <>
      <Button 
        onClick={() => setIsModalOpen(true)}
        className="w-full"
        variant="outline"
      >
        <UserIcon className="mr-2 h-4 w-4" />
        Share Status Update
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Share Status Update</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Update Type</Label>
              <Select value={type} onValueChange={(value: any) => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Stand-up</SelectItem>
                  <SelectItem value="weekly">Weekly Update</SelectItem>
                  <SelectItem value="milestone">Milestone Update</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Update Content</Label>
              <Textarea
                placeholder="What did you work on today? What are your plans for tomorrow?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>

            {tasks.length > 0 && (
              <div className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Completed Tasks
                  </Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={tasksCompleted.includes(task.id)}
                          onCheckedChange={() => toggleTaskCompleted(task.id)}
                        />
                        <span className="text-sm">{task.content}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Tasks In Progress
                  </Label>
                  <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                    {tasks.map(task => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <Checkbox
                          checked={tasksInProgress.includes(task.id)}
                          onCheckedChange={() => toggleTaskInProgress(task.id)}
                        />
                        <span className="text-sm">{task.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                Blockers/Issues
              </Label>
              <Textarea
                placeholder="Any blockers or issues you're facing?"
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-green-600" />
                Next Steps
              </Label>
              <Textarea
                placeholder="What are your next steps?"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Post Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
