
export type User = {
  uid: string;
  name: string;
  email: string;
  avatarUrl: string;
  createdAt?: any;
  lastActive?: any;
};

export type Comment = {
  id: string;
  text: string;
  author: User;
  createdAt: any;
  updatedAt?: any;
};

export type Task = {
  id: string;
  content: string;
  status: 'To Do' | 'Doing' | 'Done';
  dueDate?: string;
  priority?: 'Low' | 'Medium' | 'High';
  comments: Comment[];
  assignedTo?: string; // User UID
  createdBy: string; // User UID
  createdAt: any; // Firestore timestamp
  updatedAt?: any;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  isShared: boolean;
  members: User[];
  memberIds: string[];
  tasks: Task[];
  createdAt: any; // Firestore timestamp
  updatedAt?: any;
  tags?: string[];
  status?: 'Active' | 'Completed' | 'On Hold';
  color?: string;
  isArchived?: boolean;
};

export type StatusUpdate = {
  id: string;
  projectId: string;
  author: User;
  content: string;
  type: 'daily' | 'weekly' | 'milestone';
  createdAt: any;
  tasksCompleted?: string[];
  tasksInProgress?: string[];
  blockers?: string[];
  nextSteps?: string[];
};

export type Notification = {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'project_invite' | 'comment_added' | 'status_update';
  title: string;
  message: string;
  projectId?: string;
  taskId?: string;
  isRead: boolean;
  createdAt: any;
  actionUrl?: string;
};
