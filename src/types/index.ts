export interface Song {
  id: number;
  created_at: string;
  name: string;
  artist: string;
  duration: number; // in seconds
  file_path: string;
  user_id: string;
}
