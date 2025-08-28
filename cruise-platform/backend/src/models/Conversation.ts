// Conversation interface for TypeScript typing
export interface Conversation {
  id?: number;
  user_id: number;
  message: string;
  created_at?: Date;
  updated_at?: Date;
}

export default Conversation;