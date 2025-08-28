-- Pitch Decks Table
CREATE TABLE pitch_decks (
  id SERIAL PRIMARY KEY
  , user_id INTEGER NOT NULL REFERENCES users(id)
  ON DELETE CASCADE
  , title VARCHAR(255) NOT NULL
  , company_name VARCHAR(255)
  , description TEXT
  , query_used TEXT
  , search_results JSONB
  , generated_content JSONB
  , slide_count INTEGER DEFAULT 0
  , status VARCHAR(20) DEFAULT 'draft' CHECK (
    status IN ('draft', 'generating', 'completed', 'failed')
  )
  , template_used VARCHAR(50)
  , export_formats JSONB DEFAULT '[]'
  , visual_assets JSONB DEFAULT '{}'
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  , updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pitch_decks_user_id
ON pitch_decks(user_id);
CREATE INDEX idx_pitch_decks_status
ON pitch_decks(status);
CREATE INDEX idx_pitch_decks_created_at
ON pitch_decks(created_at);