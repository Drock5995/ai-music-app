export interface Song {
  id: number;
  created_at: string;
  name: string;
  artist: string;
  duration: number; // in seconds
  file_path: string;
  secondary_file_path?: string;
  user_id: string;
  lyrics?: string;
}

export interface Artist {
  id: number;
  created_at: string;
  name: string;
  genre?: string;
  influences?: string[];
  stylistic_elements?: string;
  vocal_preferences?: string;
  instrument_preferences?: string;
  style_notes?: string;
  tempo_range?: string;
  lyrical_themes?: string[];
  sound_descriptors?: string[];
  user_id: string;
}
