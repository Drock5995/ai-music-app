import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import SongList from './SongList';
import Navigation from './Navigation';
import LayoutToggle from './LayoutToggle';
import { useQueue } from '../contexts/QueueContext';
import GenreTabs from './GenreTabs';

export default function GenrePage() {
  const { playSong, addToQueue } = useQueue();
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    // Fetch distinct genres from artists table
    const fetchGenres = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('genre');

        if (error) throw error;

        // Extract unique genres
        const uniqueGenres = new Set<string>();
        if (data) {
          data.forEach((artist: any) => {
            if (artist.genre) uniqueGenres.add(artist.genre);
          });
        }
        setGenres(Array.from(uniqueGenres));
        if (uniqueGenres.size > 0) {
          setSelectedGenre(Array.from(uniqueGenres)[0]);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchGenres();
  }, []);

  useEffect(() => {
    if (!selectedGenre) return;

    const fetchSongsByGenre = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('songs')
          .select('*, artist:artists!inner(*)')
          .eq('artist.genre', selectedGenre)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setSongs(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSongsByGenre();
  }, [selectedGenre]);

  return (
    <div className="dashboard-layout">
      <Navigation />
      <main className="main-content">
        <h1>Genres</h1>
        {error && <div>Error: {error}</div>}
        <GenreTabs genres={genres} selectedGenre={selectedGenre} onGenreSelect={setSelectedGenre} />
        {selectedGenre && (
          <>
            <div className="genre-songs-header">
              <h2>Songs in {selectedGenre}</h2>
              <LayoutToggle layout={layout} onLayoutChange={(newLayout) => setLayout(newLayout as 'list' | 'grid')} />
            </div>
            <SongList
              songs={songs}
              loading={loading}
              error={error}
              onDataChange={() => {}}
              onPlay={playSong}
              onAddToQueue={addToQueue}
              layout={layout}
            />
          </>
        )}
      </main>
    </div>
  );
}
