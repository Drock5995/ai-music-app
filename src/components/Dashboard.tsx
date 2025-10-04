import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Artist } from '../types';
import { useAuth } from '../hooks/useAuth';
import UploadSong from './UploadSong';
import ArtistForm from './ArtistForm';
import Navigation from './Navigation';

export default function Dashboard() {
  const { session } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
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
      console.error('Error fetching artists:', error.message);
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
      console.error('Error saving artist:', error.message);
    }
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    setShowArtistForm(true);
  };



  const handleCancelEdit = () => {
    setShowArtistForm(false);
    setEditingArtist(undefined);
  };

  return (
    <div className="dashboard-layout">
      <Navigation />
      <header className="app-header">
        <div className="header-content">
          <h1>My Music</h1>
          <button onClick={handleLogout} className="button--logout" aria-label="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </header>
      <main className="main-content">
        {/* Artists Management Section */}
        <section className="dashboard-section">
          <div className="section-header">
            <h2>Manage Artists</h2>
            <button
              onClick={() => { showArtistForm ? handleCancelEdit() : setShowArtistForm(true) }}
              className="button button--secondary"
              aria-label={showArtistForm ? 'Cancel creating artist' : 'Create new artist'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              {showArtistForm ? 'Cancel' : 'Create Artist'}
            </button>
          </div>

          {showArtistForm && (
            <div className="form-container">
              <ArtistForm onSave={handleSaveArtist} artist={editingArtist} />
            </div>
          )}

          {artists.length > 0 && (
            <div className="artists-section">
              <h3>Select Artist to Edit</h3>
              <div className="artist-grid">
                {artists.map(artist => (
                  <div key={artist.id} className="artist-card" onClick={() => handleEditArtist(artist)}>
                    <div className="artist-avatar">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div className="artist-info">
                      <h4>{artist.name}</h4>
                      <p>{artist.genre || 'No genre specified'}</p>
                    </div>
                    <div className="artist-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArtist(artist);
                        }}
                        className="button--icon"
                        aria-label={`Edit ${artist.name}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {artists.length === 0 && !showArtistForm && (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M9 12l2 2 4-4"/>
                <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
              </svg>
              <h3>No artists yet</h3>
              <p>Create your first artist to start uploading music</p>
            </div>
          )}
        </section>

        {/* Upload Section */}
        <section className="dashboard-section">
          <UploadSong onDataChange={fetchArtists} artists={artists} />
        </section>
      </main>
    </div>
  );
}
