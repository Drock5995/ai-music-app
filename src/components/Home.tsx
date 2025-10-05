import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  const [editingArtist, setEditingArtist] = useState<Artist | undefined>(undefined);

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
        setEditingArtist(undefined);
      }
    } catch (error: any) {
      console.error('Error saving artist:', error.message || error);
    }
  };

  const handleEditArtist = (artist: Artist) => {
    setEditingArtist(artist);
    // ensure form is visible / in focus in main area
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-layout">
      {/* left nav / header area (keeps parity with Dashboard) */}
  <Navigation artists={artists} onEditArtist={handleEditArtist} />

  <main className="main-content grid-main">
        <PersonalizedHeader
          userName={session?.user?.email || 'User'}
          userAvatarUrl="/default-avatar.png"
        />

  <FeaturedSongs />

        <div className="home-grid">
          <motion.section className="home-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}>
            <div className="section-header">
              <h2>Create or Edit Artist</h2>
              <p className="text-muted">Add artist metadata used when uploading songs.</p>
            </div>
            <div className="card-body">
              <ArtistForm onSave={handleSaveArtist} artist={editingArtist} />
            </div>
          </motion.section>

          <motion.section className="home-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.01 }}>
            <div className="section-header">
              <h2>Upload New Song</h2>
              <p className="text-muted">Upload audio files and metadata.</p>
            </div>
            <div className="card-body">
              <UploadSong onDataChange={fetchArtists} artists={artists} />
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
