import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Artist, Song } from '../types';
import SongList from './SongList';
import Navigation from './Navigation';
import { useQueue } from '../contexts/QueueContext';

export default function ArtistPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const { playSong, addToQueue } = useQueue();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArtistAndSongs = async () => {
      try {
        setLoading(true);
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .select('*')
          .eq('id', artistId)
          .single();

        if (artistError) throw artistError;
        setArtist(artistData);

        const { data: songsData, error: songsError } = await supabase
          .from('songs')
          .select('*, artist:artists(name)')
          .eq('artist_id', artistId)
          .order('created_at', { ascending: false });

        if (songsError) throw songsError;
        setSongs(songsData || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (artistId) {
      fetchArtistAndSongs();
    }
  }, [artistId]);

  if (loading) return <div>Loading artist...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!artist) return <div>Artist not found.</div>;

  return (
    <div className="dashboard-layout">
      <Navigation />
      <main className="main-content">
        <h1>{artist.name}</h1>
        <p>Genre: {artist.genre || 'N/A'}</p>
        <p>Influences: {artist.influences?.join(', ') || 'N/A'}</p>
        <p>Stylistic Elements: {artist.stylistic_elements || 'N/A'}</p>
        <p>Vocal Preferences: {artist.vocal_preferences || 'N/A'}</p>
        <p>Instrument Preferences: {artist.instrument_preferences || 'N/A'}</p>
        <p>Style Notes: {artist.style_notes || 'N/A'}</p>
        <p>Tempo Range: {artist.tempo_range || 'N/A'}</p>
        <p>Lyrical Themes: {artist.lyrical_themes?.join(', ') || 'N/A'}</p>
        <p>Sound Descriptors: {artist.sound_descriptors?.join(', ') || 'N/A'}</p>

        <h2>Songs by {artist.name}</h2>
        <SongList songs={songs} loading={loading} error={error} onDataChange={() => {}} onPlay={playSong} onAddToQueue={addToQueue} />
      </main>
    </div>
  );
}
