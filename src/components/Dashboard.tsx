import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Song, Artist } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useQueue } from '../contexts/QueueContext';
import UploadSong from './UploadSong';
import ArtistList from './ArtistList';
import ArtistForm from './ArtistForm';
import Navigation from './Navigation';

export default function Dashboard() {
  const { session } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArtistForm, setShowArtistForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | undefined>(undefined);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setArtists(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSaveArtist = async (artist: Partial<Artist>) => {
    if (!session) return;
    try {
      const artistToSave = { ...artist, user_id: session.user.id };
      const { data, error } = await supabase.from('artists').upsert(artistToSave).select();
      if (error) throw error;
      if (data) {
        fetchArtists(); // Refresh the list
        setShowArtistForm(false);
        setEditingArtist(undefined);
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setShowArtistForm(true);
  };

  const handleDeleteArtist = async (artistId: number) => {
    try {
      const { error } = await supabase.from('artists').delete().eq('id', artistId);
      if (error) throw error;
      fetchArtists(); // Refresh the list
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCancelEdit = () => {
    setShowArtistForm(false);
    setEditingArtist(undefined);
  };

  return (
    <div className="dashboard-layout">
      <Navigation />
      <header className="app-header">
        <h1>My Music</h1>
        <button onClick={handleLogout} className="button--logout">Logout</button>
      </header>
      <main className="main-content">
        <div className="artists-section">
          <div className="app-header">
            <h2>Artists</h2>
            <button onClick={() => { showArtistForm ? handleCancelEdit() : setShowArtistForm(true) }} className="button">
              {showArtistForm ? 'Cancel' : 'Create Artist'}
            </button>
          </div>
          {showArtistForm && <ArtistForm onSave={handleSaveArtist} artist={editingArtist} />}
          {/* Replace ArtistList with dropdown */}
          <select
            className="inputField"
            onChange={(e) => {
              const selectedId = Number(e.target.value);
              const selectedArtist = artists.find(a => a.id === selectedId);
              if (selectedArtist) {
                handleEditArtist(selectedArtist);
              }
            }}
            defaultValue=""
          >
            <option value="" disabled>Select an Artist to Edit</option>
            {artists.map(artist => (
              <option key={artist.id} value={artist.id}>{artist.name}</option>
            ))}
          </select>
        </div>
        <UploadSong onDataChange={fetchArtists} artists={artists} />
      </main>
    </div>
  );
}
