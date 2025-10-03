import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import UploadSong from './UploadSong';
import SongList from './SongList';
import Player from './Player';

export default function Dashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSongs(data || []);
    } catch (error: any) {
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      <header className="app-header">
        <h1>My Music</h1>
        <button onClick={handleLogout} className="button--logout">Logout</button>
      </header>
      <main className="main-content">
        <UploadSong onDataChange={fetchSongs} />
        <SongList 
          songs={songs} 
          loading={loading} 
          error={error} 
          onDataChange={fetchSongs} 
          onPlay={setCurrentSong} 
        />
      </main>
      {currentSong && <Player song={currentSong} />}
    </div>
  );
}