// Project interface for TypeScript typing
export interface Project {
  id?: number;
  user_id: number;
  title: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export default Project;