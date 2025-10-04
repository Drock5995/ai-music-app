import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Artist } from '../types';
import PersonalizedHeader from './PersonalizedHeader';
import ArtistForm from './ArtistForm';
import UploadSong from './UploadSong';
import Navigation from './Navigation';
import FeaturedSongs from './FeaturedSongs';

export default function Home() {
  const { session } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setArtists(data || []);
    } catch (error: any) {
      console.error('Error fetching artists:', error.message || error);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const handleSaveArtist = async (artist: Partial<Artist>) => {
    if (!session) return;
    try {
      const artistToSave = { ...artist, user_id: session.user.id };
      const { data, error } = await supabase.from('artists').upsert(artistToSave).select();
      if (error) throw error;
      if (data) {
        fetchArtists();
      }
    } catch (error: any) {
      console.error('Error saving artist:', error.message || error);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* left nav / header area (keeps parity with Dashboard) */}
      <Navigation />

  <main className="main-content grid-main">
        <PersonalizedHeader
          userName={session?.user?.email || 'User'}
          userAvatarUrl="/default-avatar.png"
        />

  <FeaturedSongs />

  <div className="home-grid">
          <section className="home-card">
            <div className="section-header">
              <h2>Create or Edit Artist</h2>
              <p className="text-muted">Add artist metadata used when uploading songs.</p>
            </div>
            <div className="card-body">
              <ArtistForm onSave={handleSaveArtist} />
            </div>
          </section>

          <section className="home-card">
            <div className="section-header">
              <h2>Upload New Song</h2>
              <p className="text-muted">Upload audio files and metadata.</p>
            </div>
            <div className="card-body">
              <UploadSong onDataChange={fetchArtists} artists={artists} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
