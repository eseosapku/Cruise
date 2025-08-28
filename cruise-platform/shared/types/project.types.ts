export interface Project {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'completed' | 'archived';
    teamMembers: string[];
    tasks: Task[];
}

export interface Task {
    id: string;
    title: string;
    description: string;
    assignedTo: string;
    dueDate: Date;
    status: 'pending' | 'in-progress' | 'completed';
}