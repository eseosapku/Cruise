-- API Usage Tracking Table
CREATE TABLE api_usage (
  id SERIAL PRIMARY KEY
  , user_id INTEGER NOT NULL REFERENCES users(id)
  ON DELETE CASCADE
  , api_name VARCHAR(50) NOT NULL
  , -- 'gemini', 'bing_search', 'bing_images', 'unsplash', 'pexels'
    endpoint VARCHAR(100)
  , tokens_used INTEGER DEFAULT 0
  , requests_count INTEGER DEFAULT 1
  , cost_estimate DECIMAL(10, 4) DEFAULT 0.0000
  , response_time_ms INTEGER
  , status_code INTEGER
  , error_message TEXT
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_usage_user_id
ON api_usage(user_id);
CREATE INDEX idx_api_usage_api_name
ON api_usage(api_name);
CREATE INDEX idx_api_usage_created_at
ON api_usage(created_at);