import React from 'react';
import { useQueue } from '../contexts/QueueContext';

export default function QueueDisplay() {
  const { queue, currentIndex, removeFromQueue, playSong, clearQueue } = useQueue();

  if (queue.length === 0) {
    return <div className="queue-display">Queue is empty</div>;
  }

  return (
    <div className="queue-display">
      <h3>Up Next</h3>
      <ul>
        {queue.map((song, index) => (
          <li key={song.id} className={index === currentIndex ? 'current-song' : ''}>
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
