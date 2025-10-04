import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import SongList from './SongList';
import Navigation from './Navigation';
import { useQueue } from '../contexts/QueueContext';

export default function MusicLibrary() {
  const { playSong, addToQueue } = useQueue();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSongs(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div>
      <Navigation />
      <h1>Music Library</h1>
      {error && <div>Error: {error}</div>}
      <SongList songs={songs} loading={loading} error={error} onDataChange={fetchSongs} onPlay={playSong} onAddToQueue={addToQueue} />
    </div>
  );
}
