import React from 'react';
import { useQueue } from '../contexts/QueueContext';
import './QueuePage.css';

export default function QueuePage() {
  const { queue, currentIndex, removeFromQueue, playSong, clearQueue } = useQueue();

  if (queue.length === 0) {
    return <div className="queue-page"><h1>Queue is empty</h1></div>;
  }

  return (
    <div className="queue-page">
      <h1>Up Next</h1>
      <ul>
        {queue.map((song, index) => (
          <li key={song.id} className={index === currentIndex ? 'current-song' : ''}>
            <div className="song-details">
                <span
                role="button"
                tabIndex={0}
                onClick={() => playSong(song)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                    playSong(song);
                    }
                }}
                >
                {song.name} - {typeof song.artist === 'string' ? song.artist : (song.artist as any)?.name || 'Unknown Artist'}
                </span>
            </div>
            <button onClick={() => removeFromQueue(index)} aria-label={`Remove ${song.name} from queue`}>
              &times;
            </button>
          </li>
        ))}
      </ul>
      <button onClick={clearQueue} className="button button--secondary" aria-label="Clear queue">
        Clear Queue
      </button>
    </div>
  );
}
