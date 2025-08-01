"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Project as ProjectType, User } from "@/types";
import { Users, Lock, CheckCircle } from "lucide-react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [joining, setJoining] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    if (!projectId) {
      router.push('/');
      return;
    }

    const fetchProject = async () => {
      try {
        const projectDoc = await getDoc(doc(db, 'projects', projectId));
        if (projectDoc.exists()) {
          setProject({ id: projectDoc.id, ...projectDoc.data() } as ProjectType);
        } else {
          toast({
            variant: "destructive",
            title: "Project Not Found",
            description: "This project doesn't exist or has been deleted.",
          });
          router.push('/');
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load project details.",
        });
        router.push('/');
      }
    };

    fetchProject();
  }, [projectId, router, toast]);

  const handleJoinProject = async () => {
    if (!user || !project) return;

    setJoining(true);
    try {
      const projectRef = doc(db, 'projects', projectId);
      
      await updateDoc(projectRef, {
        memberIds: arrayUnion(user.uid),
        members: arrayUnion(user),
        isShared: true,
        updatedAt: new Date()
      });

      toast({
        title: "Successfully Joined!",
        description: `You've been added to "${project.name}".`,
      });

      // Redirect to the main page where they can see the project
      router.push('/');
    } catch (error) {
      console.error("Error joining project:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to join the project. Please try again.",
      });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You need to sign in to join this project.
            </p>
            <Button onClick={() => router.push('/login')} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  const isAlreadyMember = project.memberIds?.includes(user.uid);

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {project.name}
            {project.isShared ? (
              <Users className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Lock className="h-5 w-5 text-muted-foreground" />
            )}
          </CardTitle>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isAlreadyMember ? (
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>You're already a member of this project</span>
              </div>
              <Button onClick={() => router.push('/')} className="w-full">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>You've been invited to join this project.</p>
                <p className="mt-2">
                  <strong>Members:</strong> {project.members?.length || 0} people
                </p>
              </div>
              
              <Button 
                onClick={handleJoinProject} 
                className="w-full"
                disabled={joining}
              >
                {joining ? "Joining..." : "Join Project"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push('/')} 
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 