import { Artist, Song } from '../types';

export const generateArtistPrompt = (artist: Artist): string => {
  let prompt = `Generate a new song in the style of ${artist.name}.\n\n`;

  if (artist.genre) {
    prompt += `The genre should be ${artist.genre}.\n`;
  }

  if (artist.stylistic_elements) {
    prompt += `The song should have stylistic elements like ${artist.stylistic_elements}.\n`;
  }
  if (artist.influences && artist.influences.length > 0) {
    prompt += `The song should be inspired by artists with similar styles, but do not mention their names explicitly.\n`;
  }

  if (artist.vocal_preferences) {
    prompt += `Vocals should be ${artist.vocal_preferences}.\n`;
  }

  if (artist.instrument_preferences) {
    prompt += `Instrumentation should feature ${artist.instrument_preferences}.\n`;
  }

  if (artist.tempo_range) {
    prompt += `The tempo should be in the range of ${artist.tempo_range} BPM.\n`;
  }

  if (artist.lyrical_themes && artist.lyrical_themes.length > 0) {
    prompt += `Lyrical themes should include ${artist.lyrical_themes.join(', ')}.\n`;
  }

  if (artist.sound_descriptors && artist.sound_descriptors.length > 0) {
    prompt += `The overall sound should be described as ${artist.sound_descriptors.join(', ')}.\n`;
  }

  if (artist.style_notes) {
    prompt += `\nAdditional style notes: ${artist.style_notes}\n`;
  }

  return prompt;
};

export const generateSongPrompt = (song: Song, artist: Artist): string => {
  let prompt = `Generate a new song similar to "${song.name}" by ${song.artist}.\n\n`;

  if (song.lyrics) {
    prompt += `Use the following lyrics as inspiration:\n${song.lyrics}\n\n`;
  }

  prompt += generateArtistPrompt(artist);

  return prompt;
};
