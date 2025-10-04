import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import SongList from './SongList';
import Navigation from './Navigation';
import { useQueue } from '../contexts/QueueContext';

export default function MusicLibrary() {
  const { playSong, addToQueue, clearQueue } = useQueue();
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

  const handlePlay = (song: Song) => {
    const index = songs.findIndex(s => s.id === song.id);
    if (index === -1) return;
    clearQueue();
    for (let i = index; i < songs.length; i++) {
      addToQueue(songs[i]);
    }
    playSong(song);
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  return (
    <div className="dashboard-layout">
      <Navigation />
      <main className="main-content">
        <h1>Music Library</h1>
        {error && <div>Error: {error}</div>}
        <SongList songs={songs} loading={loading} error={error} onDataChange={fetchSongs} onPlay={handlePlay} onAddToQueue={addToQueue} />
      </main>
    </div>
  );
}
