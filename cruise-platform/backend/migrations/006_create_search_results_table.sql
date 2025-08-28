-- Search Results Table
CREATE TABLE search_results (
  id SERIAL PRIMARY KEY
  , user_id INTEGER NOT NULL REFERENCES users(id)
  ON DELETE CASCADE
  , query VARCHAR(500) NOT NULL
  , search_type VARCHAR(20) DEFAULT 'web' CHECK (search_type IN ('web', 'news', 'images', 'videos'))
  , results JSONB NOT NULL
  , total_results INTEGER DEFAULT 0
  , search_engine VARCHAR(20) DEFAULT 'bing'
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_results_user_id
ON search_results(user_id);
CREATE INDEX idx_search_results_query
ON search_results(query);
CREATE INDEX idx_search_results_type
ON search_results(search_type);