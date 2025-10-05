import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import SongList from './SongList';
import Navigation from './Navigation';
import LayoutToggle from './LayoutToggle';
import PersonalizedHeader from './PersonalizedHeader';
import FloatingActionButton from './FloatingActionButton';
import { useQueue } from '../contexts/QueueContext';
import './MusicLibrary.css';

export default function MusicLibrary() {
  const { playSong, addToQueue, clearQueue } = useQueue();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'list' | 'grid' | 'compact'>('list');

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
    <div className="dashboard-layout music-library-root">
      <Navigation />
      <PersonalizedHeader
        userName="User"
        userAvatarUrl="/default-avatar.png"
        greeting={undefined}
        onSettingsClick={() => {
          // toggle theme placeholder
          document.documentElement.classList.toggle('dark');
        }}
      />
      <main className="main-content">
        <div className="library-header">
          <h1>Music Library</h1>
          <LayoutToggle layout={layout} onLayoutChange={(newLayout) => setLayout(newLayout)} />
        </div>
        {error && <div>Error: {error}</div>}
        <SongList
          songs={songs}
          loading={loading}
          error={error}
          onDataChange={fetchSongs}
          onPlay={handlePlay}
          onAddToQueue={addToQueue}
          layout={layout}
        />
      </main>
      <FloatingActionButton
        onClick={() => {
          // Placeholder for playlist FAB action
          alert('Open playlists');
        }}
      />
    </div>
  );
}