import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import SongList from './SongList';
import Navigation from './Navigation';
import { useQueue } from '../contexts/QueueContext';

export default function GenrePage() {
  const { playSong, addToQueue } = useQueue();
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <div className="genre-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {genres.map((genre) => (
            <button key={genre} onClick={() => setSelectedGenre(genre)} className="button button--secondary">
              {genre}
            </button>
          ))}
        </div>
        {selectedGenre && (
          <>
            <h2>Songs in {selectedGenre}</h2>
            <SongList songs={songs} loading={loading} error={error} onDataChange={() => {}} onPlay={playSong} onAddToQueue={addToQueue} />
          </>
        )}
      </main>
    </div>
  );
}
