-- Visual Assets Table
CREATE TABLE visual_assets (
  id SERIAL PRIMARY KEY
  , pitch_deck_id INTEGER REFERENCES pitch_decks(id)
  ON DELETE CASCADE
  , slide_id INTEGER REFERENCES pitch_deck_slides(id)
  ON DELETE CASCADE
  , asset_type VARCHAR(20) NOT NULL CHECK (
    asset_type IN ('image', 'svg', 'chart', 'diagram', 'icon')
  )
  , asset_source VARCHAR(50)
  , -- 'bing', 'unsplash', 'pexels', 'ai_generated', 'svg_generated'
    file_path TEXT
  , url TEXT
  , alt_text TEXT
  , metadata JSONB DEFAULT '{}'
  , file_size INTEGER
  , width INTEGER
  , height INTEGER
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visual_assets_pitch_deck_id
ON visual_assets(pitch_deck_id);
CREATE INDEX idx_visual_assets_slide_id
ON visual_assets(slide_id);
CREATE INDEX idx_visual_assets_type
ON visual_assets(asset_type);