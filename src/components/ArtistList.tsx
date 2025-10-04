import React, { useState } from 'react';
import { Artist } from '../types';
import { generateArtistPrompt } from '../utils/prompt';

interface ArtistListProps {
  artists: Artist[];
  onEdit: (artist: Artist) => void;
  onDelete: (artistId: number) => void;
}

const ArtistList: React.FC<ArtistListProps> = ({ artists, onEdit, onDelete }) => {
  const [showPrompt, setShowPrompt] = useState<{[key: number]: string}>({});

  const handleGeneratePrompt = (artist: Artist) => {
    const prompt = generateArtistPrompt(artist);
    setShowPrompt(prev => ({...prev, [artist.id]: prompt}));
  };

  const handleClosePrompt = (artistId: number) => {
    setShowPrompt(prev => {
      const newState = {...prev};
      delete newState[artistId];
      return newState;
    });
  };

  return (
    <div className="artist-list">
      {artists.map(artist => (
        <div key={artist.id} className="artist-item">
          <h3>{artist.name}</h3>
          <p>Genre: {artist.genre}</p>
          <div className="actions">
            <button onClick={() => onEdit(artist)} className="button button--secondary">Edit</button>
            <button onClick={() => onDelete(artist.id)} className="button button--secondary">Delete</button>
            <button onClick={() => handleGeneratePrompt(artist)} className="button button--secondary">Generate AI Prompt</button>
          </div>
          {showPrompt[artist.id] && (
            <div className="prompt-display">
              <h4>AI Prompt:</h4>
              <textarea
                value={showPrompt[artist.id]}
                readOnly
                rows={10}
                className="textarea"
                aria-label="AI generated prompt for artist"
              />
              <button onClick={() => navigator.clipboard.writeText(showPrompt[artist.id])} className="button button--secondary m-t-sm">Copy to Clipboard</button>
              <button onClick={() => handleClosePrompt(artist.id)} className="button button--secondary m-t-sm">Close</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ArtistList;
