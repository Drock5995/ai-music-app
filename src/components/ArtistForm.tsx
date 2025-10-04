import React, { useState, useEffect } from 'react';
import { Artist } from '../types';

interface ArtistFormProps {
  onSave: (artist: Partial<Artist>) => void;
  artist?: Artist;
}

const ArtistForm: React.FC<ArtistFormProps> = ({ onSave, artist }) => {
  const [name, setName] = useState('');
  const [genre, setGenre] = useState('');
  const [influences, setInfluences] = useState('');
  const [stylistic_elements, setStylisticElements] = useState('');
  const [vocal_preferences, setVocalPreferences] = useState('');
  const [instrument_preferences, setInstrumentPreferences] = useState('');
  const [style_notes, setStyleNotes] = useState('');
  const [tempo_range, setTempoRange] = useState('');
  const [lyrical_themes, setLyricalThemes] = useState('');
  const [sound_descriptors, setSoundDescriptors] = useState('');

  useEffect(() => {
    if (artist) {
      setName(artist.name || '');
      setGenre(artist.genre || '');
      setInfluences(artist.influences?.join(', ') || '');
      setStylisticElements(artist.stylistic_elements || '');
      setVocalPreferences(artist.vocal_preferences || '');
      setInstrumentPreferences(artist.instrument_preferences || '');
      setStyleNotes(artist.style_notes || '');
      setTempoRange(artist.tempo_range || '');
      setLyricalThemes(artist.lyrical_themes?.join(', ') || '');
      setSoundDescriptors(artist.sound_descriptors?.join(', ') || '');
    }
  }, [artist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...artist,
      name,
      genre,
      influences: influences.split(',').map(s => s.trim()),
      stylistic_elements,
      vocal_preferences,
      instrument_preferences,
      style_notes,
      tempo_range,
      lyrical_themes: lyrical_themes.split(',').map(s => s.trim()),
      sound_descriptors: sound_descriptors.split(',').map(s => s.trim()),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="artist-form">
      <label>Name</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} />
      
      <label>Genre</label>
      <input type="text" value={genre} onChange={e => setGenre(e.target.value)} />

      <label>Influences (comma-separated)</label>
      <input type="text" value={influences} onChange={e => setInfluences(e.target.value)} />

      <label>Stylistic Elements (describe without naming artists)</label>
      <textarea value={stylistic_elements} onChange={e => setStylisticElements(e.target.value)} />

      <label>Vocal Preferences</label>
      <input type="text" value={vocal_preferences} onChange={e => setVocalPreferences(e.target.value)} />

      <label>Instrument Preferences</label>
      <input type="text" value={instrument_preferences} onChange={e => setInstrumentPreferences(e.target.value)} />

      <label>Style Notes</label>
      <textarea value={style_notes} onChange={e => setStyleNotes(e.target.value)} />

      <label>Tempo Range (e.g., 120-140)</label>
      <input type="text" value={tempo_range} onChange={e => setTempoRange(e.target.value)} />

      <label>Lyrical Themes (comma-separated)</label>
      <input type="text" value={lyrical_themes} onChange={e => setLyricalThemes(e.target.value)} />

      <label>Sound Descriptors (comma-separated)</label>
      <input type="text" value={sound_descriptors} onChange={e => setSoundDescriptors(e.target.value)} />

      <button type="submit" className="button">Save Artist</button>
    </form>
  );
};

export default ArtistForm;
