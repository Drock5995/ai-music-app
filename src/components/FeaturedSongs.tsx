import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface Song {
  id: number;
  name: string;
  artist: string;
  file_path: string;
}

export default function FeaturedSongs() {
  const [songs, setSongs] = useState<Song[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const { data } = await supabase.from('songs').select('id,name,artist,file_path').order('created_at', { ascending: false }).limit(6);
        if (mounted) setSongs(data || []);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (songs.length === 0) return null;

  return (
    <section className="featured-hero">
      <h2>Featured</h2>
      <div className="featured-list">
        {songs.map(s => (
          <div key={s.id} className="featured-item">
            <div className="featured-artwork" aria-hidden>
              <img src="/default-artwork.png" alt="" />
            </div>
            <div className="featured-meta">
              <div className="featured-title">{s.name}</div>
              <div className="featured-artist">{s.artist}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
