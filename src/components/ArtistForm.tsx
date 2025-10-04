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
  const [errors, setErrors] = useState<{ name?: string; genre?: string }>({});

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
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = 'Name is required';
    if (!genre.trim()) nextErrors.genre = 'Genre is required';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
      <label htmlFor="artist-name">Name</label>
      <input
        id="artist-name"
        type="text"
        value={name}
        placeholder="Artist name"
  onChange={e => setName(e.target.value)}
      />
      {errors.name && <div role="alert" className="input-error">{errors.name}</div>}

      <label htmlFor="artist-genre">Genre</label>
      <input
        id="artist-genre"
        type="text"
        value={genre}
        placeholder="e.g. Indie Pop"
  onChange={e => setGenre(e.target.value)}
      />
      {errors.genre && <div role="alert" className="input-error">{errors.genre}</div>}

      <label htmlFor="artist-influences">Influences (comma-separated)</label>
      <input id="artist-influences" type="text" value={influences} placeholder="Artist A, Artist B" onChange={e => setInfluences(e.target.value)} />

      <label htmlFor="artist-stylistic">Stylistic Elements (describe without naming artists)</label>
      <textarea id="artist-stylistic" value={stylistic_elements} placeholder="e.g. lush synths, tight rhythms" onChange={e => setStylisticElements(e.target.value)} />

      <label htmlFor="artist-vocals">Vocal Preferences</label>
      <input id="artist-vocals" type="text" value={vocal_preferences} placeholder="e.g. breathy, powerful" onChange={e => setVocalPreferences(e.target.value)} />

      <label htmlFor="artist-instruments">Instrument Preferences</label>
      <input id="artist-instruments" type="text" value={instrument_preferences} placeholder="e.g. electric guitar, strings" onChange={e => setInstrumentPreferences(e.target.value)} />

      <label htmlFor="artist-stylenotes">Style Notes</label>
      <textarea id="artist-stylenotes" value={style_notes} placeholder="Short notes" onChange={e => setStyleNotes(e.target.value)} />

      <label htmlFor="artist-tempo">Tempo Range (e.g., 120-140)</label>
      <input id="artist-tempo" type="text" value={tempo_range} placeholder="e.g. 100-130" onChange={e => setTempoRange(e.target.value)} />

      <label htmlFor="artist-lyrics">Lyrical Themes (comma-separated)</label>
      <input id="artist-lyrics" type="text" value={lyrical_themes} placeholder="love, loss, city" onChange={e => setLyricalThemes(e.target.value)} />

      <label htmlFor="artist-sound">Sound Descriptors (comma-separated)</label>
      <input id="artist-sound" type="text" value={sound_descriptors} placeholder="warm, bright, lo-fi" onChange={e => setSoundDescriptors(e.target.value)} />

      <button type="submit" className="button">Save Artist</button>
    </form>
  );
};

export default ArtistForm;
