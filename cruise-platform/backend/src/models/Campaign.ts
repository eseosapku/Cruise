// LinkedIn Campaign interface for TypeScript typing
export interface LinkedInCampaign {
  id?: number;
  user_id: number;
  campaign_name: string;
  target_criteria: any;
  message_template: string;
  status?: 'draft' | 'active' | 'paused' | 'completed';
  total_sent?: number;
  total_responses?: number;
  total_connections?: number;
  started_at?: Date;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export default LinkedInCampaign;