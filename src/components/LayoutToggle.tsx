import { useState } from 'react';

interface LayoutToggleProps {
  layout: 'list' | 'grid' | 'compact';
  onLayoutChange: (layout: 'list' | 'grid' | 'compact') => void;
}

export default function LayoutToggle({ layout, onLayoutChange }: LayoutToggleProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLayoutChange = (newLayout: 'list' | 'grid' | 'compact') => {
    if (newLayout === layout) return;

    setIsAnimating(true);
    onLayoutChange(newLayout);

    // Reset animation state after transition
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="layout-toggle">
      <button
        className={`layout-toggle-btn ${layout === 'list' ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
        onClick={() => handleLayoutChange('list')}
        aria-label="Switch to list view"
        aria-pressed={layout === 'list' ? 'true' : 'false'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span className="layout-toggle-label">List</span>
      </button>

      <button
        className={`layout-toggle-btn ${layout === 'grid' ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
        onClick={() => handleLayoutChange('grid')}
        aria-label="Switch to grid view"
        aria-pressed={layout === 'grid' ? 'true' : 'false'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <rect x="3" y="3" width="7" height="7"/>
          <rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/>
          <rect x="3" y="14" width="7" height="7"/>
        </svg>
        <span className="layout-toggle-label">Grid</span>
      </button>

      <button
        className={`layout-toggle-btn ${layout === 'compact' ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
        onClick={() => handleLayoutChange('compact')}
        aria-label="Switch to compact view"
        aria-pressed={layout === 'compact' ? 'true' : 'false'}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 4.5h18M3 9.5h18M3 14.5h18M3 19.5h18"/>
        </svg>
        <span className="layout-toggle-label">Compact</span>
      </button>
    </div>
  );
}
