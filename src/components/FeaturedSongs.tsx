import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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

  const container = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.06 } },
  };

  const item = {
    hidden: { opacity: 0, y: 6 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.section className="featured-hero" initial="hidden" animate="show" variants={container}>
      <h2>Featured</h2>
      <div className="featured-list">
        {songs.map(s => (
          <motion.div key={s.id} className="featured-item" variants={item} whileHover={{ scale: 1.02 }}>
            <div className="featured-artwork" aria-hidden>
              <img src="/default-artwork.png" alt="" />
            </div>
            <div className="featured-meta">
              <div className="featured-title">{s.name}</div>
              <div className="featured-artist">{s.artist}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
