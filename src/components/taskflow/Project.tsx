
"use client";

import type { Project as ProjectType, Task, User } from "@/types";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Users, PlusCircle, Calendar, Clock, CheckCircle, AlertCircle, Archive, Settings } from "lucide-react";
import { TaskList } from "./TaskList";
import { AddTask } from "./AddTask";
import { StatusUpdate } from "./StatusUpdate";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { addDoc, collection, doc, updateDoc, deleteDoc, arrayUnion, query, where, getDocs, serverTimestamp, getDoc, onSnapshot, orderBy, limit } from "firebase/firestore";
import { format, parseISO } from 'date-fns';

interface ProjectProps {
  project: ProjectType;
}

export function Project({ project }: ProjectProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(project.name);
  const [projectDescription, setProjectDescription] = useState(project.description || "");
  const [statusUpdates, setStatusUpdates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("tasks");

  // Fetch status updates
  useEffect(() => {
    const statusUpdatesRef = collection(db, `projects/${project.id}/statusUpdates`);
    const q = query(statusUpdatesRef, orderBy('createdAt', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStatusUpdates(updates);
    });

    return () => unsubscribe();
  }, [project.id]);

  const handleAddTask = async (content: string) => {
    if (!content.trim()) return;
    const tasksCollectionRef = collection(db, `projects/${project.id}/tasks`);
    await addDoc(tasksCollectionRef, {
      content,
      status: "To Do",
      comments: [],
      createdBy: user?.uid,
      createdAt: serverTimestamp(),
    });

    toast({
      title: "Task Added",
      description: `"${content}" has been added to your project.`,
    });
  };

  const handleUpdateTask = async (taskId: string, updatedValues: Partial<Task>) => {
    const taskDocRef = doc(db, `projects/${project.id}/tasks`, taskId);
    await updateDoc(taskDocRef, {
      ...updatedValues,
      updatedAt: serverTimestamp()
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    const taskDocRef = doc(db, `projects/${project.id}/tasks`, taskId);
    await deleteDoc(taskDocRef);
    toast({
      title: "Task Deleted",
      variant: "destructive",
      description: `A task has been removed from your project.`,
    });
  };

  const handleInviteUser = async () => {
    if(!inviteEmail.trim()) return;

    try {
      // Add a small delay to prevent Firebase internal assertion errors
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const usersRef = collection(db, "users");
      
      // Try to find user by email (this might fail due to security rules)
      let userToInvite: User | null = null;
      
      try {
        const q = query(usersRef, where("email", "==", inviteEmail.toLowerCase().trim()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          userToInvite = { 
            uid: userDoc.id, 
            name: userData.name,
            email: userData.email,
            avatarUrl: userData.avatarUrl
          } as User;
        }
      } catch (queryError) {
        console.warn("Could not query users by email:", queryError);
        
        // Show a helpful message to the user
        toast({
          title: "User Invitation",
          description: "Please ask the user to sign up first, then try inviting them again. You can also share the project link directly.",
        });
        return;
      }

      if (!userToInvite) {
        toast({
          variant: "destructive",
          title: "User not found",
          description: "No user with that email address exists. Please ask them to sign up first, then try inviting them again.",
        });
        return;
      }
      
      if (project.memberIds.includes(userToInvite.uid)) {
        toast({
          variant: "destructive",
          title: "User already in project",
          description: "This user is already a member of this project.",
        });
        return;
      }

      const projectRef = doc(db, "projects", project.id);
      
      // Update the project with the new member
      await updateDoc(projectRef, {
        memberIds: arrayUnion(userToInvite.uid),
        members: arrayUnion(userToInvite),
        isShared: true,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "User Invited",
        description: `${userToInvite.name} has been added to the project.`,
      });
      setInviteEmail("");
      setInviteModalOpen(false);

    } catch (error) {
      console.error("Error inviting user:", error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes("permission-denied")) {
          toast({
            variant: "destructive",
            title: "Permission Denied",
            description: "You don't have permission to invite users. Please check your Firebase security rules.",
          });
        } else if (error.message.includes("unavailable")) {
          toast({
            variant: "destructive",
            title: "Service Unavailable",
            description: "Firebase service is temporarily unavailable. Please try again later.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error inviting user",
            description: "An error occurred while trying to invite the user. Please try again.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error inviting user",
          description: "An error occurred while trying to invite the user. Please try again.",
        });
      }
    }
  };

  const handleUpdateProject = async () => {
    try {
      const projectRef = doc(db, "projects", project.id);
      await updateDoc(projectRef, {
        name: projectName,
        description: projectDescription,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Project Updated",
        description: "Project settings have been saved.",
      });
      setSettingsModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update project settings.",
      });
    }
  };

  const getTaskStats = () => {
    const total = project.tasks.length;
    const completed = project.tasks.filter(t => t.status === 'Done').length;
    const inProgress = project.tasks.filter(t => t.status === 'Doing').length;
    const todo = project.tasks.filter(t => t.status === 'To Do').length;
    
    return { total, completed, inProgress, todo };
  };

  const stats = getTaskStats();

  return (
    <>
    <Card className="overflow-hidden shadow-md transition-shadow hover:shadow-lg bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex-1">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            {project.name}
            {project.isShared ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Users className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Shared Project</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Personal Project</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsModalOpen(true)}
              className="h-6 w-6"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </CardTitle>
          {project.description && (
            <CardDescription className="mt-2">
              {project.description}
            </CardDescription>
          )}
          
          {/* Task Statistics */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">{stats.completed}</span>
              <span className="text-xs text-muted-foreground">done</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">{stats.inProgress}</span>
              <span className="text-xs text-muted-foreground">in progress</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">{stats.todo}</span>
              <span className="text-xs text-muted-foreground">to do</span>
            </div>
          </div>
        </div>
        <div className="flex items-center -space-x-2 overflow-hidden">
           {project.members && project.members.map((member) => (
            <TooltipProvider key={member.uid}>
               <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="inline-block border-2 border-background">
                    <AvatarImage src={`${member.avatarUrl}?u=${member.uid}`} alt={member.name || ''} data-ai-hint="profile person" />
                    <AvatarFallback>{member.name ? member.name.charAt(0) : '?'}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>{member.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full bg-muted hover:bg-muted-foreground/20 ml-1" onClick={() => setInviteModalOpen(true)}>
                  <PlusCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Invite Member</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="updates">Updates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-4">
            <TaskList
              tasks={project.tasks}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          </TabsContent>
          
          <TabsContent value="updates" className="space-y-4">
            {user && (
              <StatusUpdate
                projectId={project.id}
                tasks={project.tasks}
                members={project.members}
                currentUser={user}
              />
            )}
            
            <div className="space-y-4">
              {statusUpdates && statusUpdates.length > 0 && statusUpdates.map((update) => (
                <Card key={update.id || `update-${Date.now()}`} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={update.author.avatarUrl} alt={update.author.name} />
                      <AvatarFallback>{update.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{update.author.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {update.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {update.createdAt && format(update.createdAt.toDate(), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm mb-3">{update.content || 'No content'}</p>
                      
                      {update.tasksCompleted && Array.isArray(update.tasksCompleted) && update.tasksCompleted.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-green-600">Completed:</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {update.tasksCompleted.map((taskId: string) => {
                              const task = project.tasks.find(t => t.id === taskId);
                              return task ? <div key={taskId}>• {task.content}</div> : null;
                            })}
                          </div>
                        </div>
                      )}
                      
                      {update.blockers && Array.isArray(update.blockers) && update.blockers.length > 0 && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-red-600">Blockers:</span>
                          <div className="text-xs text-muted-foreground mt-1">
                            {update.blockers.map((blocker: string, index: number) => (
                              <div key={`${update.id}-blocker-${index}-${blocker.substring(0, 10)}`}>• {blocker}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              
              {statusUpdates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No status updates yet. Share your first update!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-4 bg-muted/50 p-4">
        <AddTask onAddTask={handleAddTask} />
      </CardFooter>
    </Card>

    {/* Invite User Modal */}
    <Dialog open={isInviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Choose how you want to invite people to this project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="invite-email" className="text-sm font-medium">Email Invitation</label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="member@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
                <Button 
                  onClick={handleInviteUser}
                  className="w-full"
                  disabled={!inviteEmail.trim()}
                >
                  Send Email Invitation
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Share Project Link</label>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}/project/${project.id}`}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/project/${project.id}`);
                      toast({
                        title: "Link Copied",
                        description: "Project link copied to clipboard!",
                      });
                    }}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this link with your team members. They'll need to sign up first, then they can join the project.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    {/* Project Settings Modal */}
    <Dialog open={isSettingsModalOpen} onOpenChange={setSettingsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="project-name" className="text-sm font-medium">Project Name</label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="project-description" className="text-sm font-medium">Description</label>
              <Input
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Project description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdateProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
