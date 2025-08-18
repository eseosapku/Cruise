-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_audience TEXT,
  problem_statement TEXT,
  solution TEXT,
  market_size VARCHAR(255),
  validation_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  agenda TEXT,
  participants JSONB,
  meeting_date TIMESTAMP,
  duration INTEGER, -- in minutes
  notes TEXT,
  ai_assistance JSONB,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Outreach table
CREATE TABLE IF NOT EXISTS outreach (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  campaign_id VARCHAR(255),
  profile_id VARCHAR(255) NOT NULL,
  profile_name VARCHAR(255),
  profile_url VARCHAR(255),
  message TEXT,
  template_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP,
  replied_at TIMESTAMP,
  response_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Pitch Decks table
CREATE TABLE IF NOT EXISTS pitch_decks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slides JSONB,
  template_id VARCHAR(100),
  version INTEGER DEFAULT 1,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Research Data table
CREATE TABLE IF NOT EXISTS research_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
  query VARCHAR(255),
  domain VARCHAR(255),
  data_type VARCHAR(100),
  raw_data JSONB,
  analysis JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Co-founder Candidates table
CREATE TABLE IF NOT EXISTS cofounder_candidates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  profile_id VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  title VARCHAR(255),
  company VARCHAR(255),
  location VARCHAR(255),
  skills JSONB,
  experience VARCHAR(255),
  profile_url VARCHAR(255),
  suitability_score INTEGER,
  match_reasons JSONB,
  contact_status VARCHAR(50) DEFAULT 'not_contacted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_user_id ON outreach(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_campaign_id ON outreach(campaign_id);
CREATE INDEX IF NOT EXISTS idx_pitch_decks_user_id ON pitch_decks(user_id);
CREATE INDEX IF NOT EXISTS idx_research_data_user_id ON research_data(user_id);
CREATE INDEX IF NOT EXISTS idx_cofounder_candidates_user_id ON cofounder_candidates(user_id);
