
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { Song } from '../types';
import SongCard from './SongCard';

interface SearchResult {
  type: 'song' | 'artist' | 'genre';
  item: Song | string;
  relevance: number;
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'songs' | 'artists' | 'genres'>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load all songs for search
  useEffect(() => {
    const loadSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSongs(data);
      }
    };

    loadSongs();
  }, []);

  // Save recent search
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Perform search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search songs
    if (activeFilter === 'all' || activeFilter === 'songs') {
      songs.forEach(song => {
        let relevance = 0;

        // Exact title match
        if (song.name.toLowerCase() === query) relevance += 100;
        // Title starts with query
        else if (song.name.toLowerCase().startsWith(query)) relevance += 80;
        // Title contains query
        else if (song.name.toLowerCase().includes(query)) relevance += 60;

        // Artist match
        const artistName = typeof song.artist === 'string' ? song.artist : (song.artist as any)?.name || '';
        if (artistName.toLowerCase().includes(query)) relevance += 40;

        if (relevance > 0) {
          searchResults.push({
            type: 'song',
            item: song,
            relevance
          });
        }
      });
    }

    // Search artists
    if (activeFilter === 'all' || activeFilter === 'artists') {
      const artists = new Set<string>();
      songs.forEach(song => {
        const artistName = typeof song.artist === 'string' ? song.artist : (song.artist as any)?.name || '';
        if (artistName && artistName.toLowerCase().includes(query)) {
          artists.add(artistName);
        }
      });

      artists.forEach(artist => {
        searchResults.push({
          type: 'artist',
          item: artist,
          relevance: 50
        });
      });
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    setResults(searchResults.slice(0, 20)); // Limit to 20 results
    setIsSearching(false);
  }, [songs, activeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeFilter, songs, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
    }
  };

  const handleRecentSearchClick = (searchQuery: string) => {
    setQuery(searchQuery);
    searchInputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Highlight matching text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">{part}</mark>
      ) : part
    );
  };

  const filters = [
    { id: 'all', label: 'All', icon: '🔍' },
    { id: 'songs', label: 'Songs', icon: '🎵' },
    { id: 'artists', label: 'Artists', icon: '👤' },
    { id: 'genres', label: 'Genres', icon: '🏷️' }
  ] as const;

  return (
    <div className="search-page">
      {/* Search Header */}
      <div className="search-header">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, genres..."
              className="search-input"
              autoComplete="off"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="search-clear"
                aria-label="Clear search"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Filter Chips */}
        <div className="search-filters">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`search-filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
            >
              <span className="filter-icon">{filter.icon}</span>
              <span>{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Content */}
      <div className="search-content">
        {!query && !isSearching ? (
          /* Recent Searches */
          <div className="recent-searches">
            <div className="recent-searches-header">
              <h2 className="recent-searches-title">Recent Searches</h2>
              {recentSearches.length > 0 && (
                <button
                  onClick={clearRecentSearches}
                  className="clear-recent-btn"
                  aria-label="Clear recent searches"
                >
                  Clear
                </button>
              )}
            </div>
            {recentSearches.length > 0 ? (
              <div className="recent-searches-list">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="recent-search-item"
                  >
                    <svg className="recent-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12,6 12,12 16,14" />
                    </svg>
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="no-recent-searches">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <p>No recent searches</p>
              </div>
            )}
          </div>
        ) : (
          /* Search Results */
          <AnimatePresence mode="wait">
            <motion.div
              key={isSearching ? 'searching' : results.length > 0 ? 'results' : query ? 'no-results' : 'empty'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="search-results"
            >
              {isSearching ? (
                <motion.div
                  className="search-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div
                    className="loading-spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  <p>Searching...</p>
                </motion.div>
              ) : results.length > 0 ? (
                <>
                  <motion.div
                    className="search-results-header"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h2 className="search-results-title">
                      {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                    </h2>
                  </motion.div>
                  <motion.div
                    className="search-results-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <AnimatePresence>
                      {results.map((result, index) => (
                        <motion.div
                          key={`${result.type}-${index}`}
                          className="search-result-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            delay: index * 0.05,
                            duration: 0.3,
                            type: 'spring',
                            stiffness: 300
                          }}
                        >
                          {result.type === 'song' ? (
                            <SongCard
                              song={result.item as Song}
                              onPlay={(song) => {
                                // Handle play - this would need to be passed as prop
                                console.log('Play song:', song);
                              }}
                              layout="list"
                              showArtwork={true}
                            />
                          ) : (
                            <motion.div
                              className="search-result-other"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="search-result-icon">
                                {result.type === 'artist' ? '👤' : '🏷️'}
                              </div>
                              <div className="search-result-info">
                                <h3 className="search-result-title">
                                  {highlightText(result.item as string, query)}
                                </h3>
                                <p className="search-result-type">{result.type}</p>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : query ? (
                <motion.div
                  className="no-results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                    <line x1="13" y1="9" x2="9" y2="13" />
                  </motion.svg>
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No results found
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Try adjusting your search terms or filters
                  </motion.p>
                </motion.div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
