
"use client";

import { Header } from '@/components/taskflow/Header';
import { Project } from '@/components/taskflow/Project';
import type { Project as ProjectType } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'projects'), where('memberIds', 'array-contains', user.uid));
      
      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        const projectsData: ProjectType[] = [];
        for (const projectDoc of querySnapshot.docs) {
          const projectData = projectDoc.data();
          
          projectsData.push({
            id: projectDoc.id,
            name: projectData.name,
            isShared: projectData.isShared,
            members: projectData.members || [],
            memberIds: projectData.memberIds,
            tasks: [], // Initially empty, will be populated by the tasks snapshot
            createdAt: projectData.createdAt
          });
        }
        setProjects(projectsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if(!user) return;

    if (projects.length === 0) return;

    const unsubscribes = projects.map((project) => {
      const tasksCollection = collection(db, `projects/${project.id}/tasks`);
      return onSnapshot(tasksCollection, (tasksSnapshot) => {
        const tasks = tasksSnapshot.docs.map(taskDoc => ({
          id: taskDoc.id,
          ...taskDoc.data()
        }));

        setProjects(prevProjects => {
          const newProjects = [...prevProjects];
          const projIndex = newProjects.findIndex(p => p.id === project.id);
          if (projIndex > -1) {
            newProjects[projIndex].tasks = tasks as any;
          }
          return newProjects;
        });
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());

  }, [projects.length, user]);


  const handleCreateProject = async () => {
    if (user && newProjectName.trim() !== '') {
      await addDoc(collection(db, 'projects'), {
        name: newProjectName,
        isShared: false,
        members: [user],
        memberIds: [user.uid],
        createdAt: serverTimestamp()
      });
      setNewProjectName("");
      setIsModalOpen(false);
    }
  }

  if (loading || !user) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 w-full p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
             <h1 className="text-2xl font-bold">Your Projects</h1>
             <Button onClick={() => setIsModalOpen(true)}>Create Project</Button>
          </div>
          <div className="grid gap-8">
            {projects.map((project) => (
              <Project key={project.id} project={project} />
            ))}
            {projects.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No projects yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Give your new project a name to get started.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="project-name">Project Name</Label>
            <Input 
              id="project-name" 
              value={newProjectName} 
              onChange={(e) => setNewProjectName(e.target.value)} 
              placeholder="e.g. Q3 Marketing Campaign"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateProject}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
