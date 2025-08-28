// PitchDeck interface for TypeScript typing
export interface PitchDeck {
  id?: number;
  user_id: number;
  title: string;
  company_name?: string;
  description?: string;
  query_used?: string;
  search_results?: any;
  generated_content?: any;
  slide_count?: number;
  status?: 'draft' | 'generating' | 'completed' | 'failed';
  template_used?: string;
  export_formats?: any;
  visual_assets?: any;
  created_at?: Date;
  updated_at?: Date;
}

// PitchDeck slide interface
export interface PitchDeckSlide {
  id?: number;
  pitch_deck_id: number;
  slide_number: number;
  slide_type: string;
  title?: string;
  content?: string;
  notes?: string;
  images?: any;
  svg_elements?: any;
  layout?: string;
  background_color?: string;
  text_color?: string;
  created_at?: Date;
  updated_at?: Date;
}

export default PitchDeck;