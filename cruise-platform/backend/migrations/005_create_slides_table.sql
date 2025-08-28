-- Pitch Deck Slides Table
CREATE TABLE pitch_deck_slides (
  id SERIAL PRIMARY KEY
  , pitch_deck_id INTEGER NOT NULL REFERENCES pitch_decks(id)
  ON DELETE CASCADE
  , slide_number INTEGER NOT NULL
  , slide_type VARCHAR(50) NOT NULL
  , title VARCHAR(255)
  , content TEXT
  , notes TEXT
  , images JSONB DEFAULT '[]'
  , svg_elements JSONB DEFAULT '[]'
  , layout VARCHAR(50)
  , background_color VARCHAR(20)
  , text_color VARCHAR(20)
  , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  , updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  , UNIQUE(pitch_deck_id, slide_number)
);

CREATE INDEX idx_slides_pitch_deck_id
ON pitch_deck_slides(pitch_deck_id);
CREATE INDEX idx_slides_slide_number
ON pitch_deck_slides(slide_number);