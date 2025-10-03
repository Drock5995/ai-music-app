import { Song } from '../types';
import { supabase } from '../supabaseClient';

interface PlayerProps {
  song: Song;
}

const getSongUrl = (filePath: string) => {
  const { data } = supabase.storage.from('song-files').getPublicUrl(filePath);
  return data.publicUrl;
};

export default function Player({ song }: PlayerProps) {
  if (!song) {
    return null;
  }

  return (
    <div className="player-sticky">
      <div className="player-info">
        <p className="player-song-name">{song.name}</p>
        <p className="player-artist-name">{song.artist}</p>
      </div>
      <audio
        key={song.id}
        controls
        autoPlay
        src={getSongUrl(song.file_path)}
        className="audio-player"
      >
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}
