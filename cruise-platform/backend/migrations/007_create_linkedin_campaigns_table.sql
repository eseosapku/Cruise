-- LinkedIn Campaigns Table
CREATE TABLE linkedin_campaigns (
  id SERIAL PRIMARY KEY
  , user_id INTEGER NOT NULL REFERENCES users(id)
  ON DELETE CASCADE
  , campaign_name VARCHAR(255) NOT NULL
  , target_criteria JSONB NOT NULL
  , message_template TEXT NOT NULL
  , status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed'))
  , total_sent INTEGER DEFAULT 0
  , total_responses INTEGER DEFAULT 0
  , total_connections INTEGER DEFAULT 0
  , started_at TIMESTAMP
  , completed_at TIMESTAMP
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  , updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_linkedin_campaigns_user_id
ON linkedin_campaigns(user_id);
CREATE INDEX idx_linkedin_campaigns_status
ON linkedin_campaigns(status);