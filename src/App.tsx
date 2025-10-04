import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { QueueProvider } from './contexts/QueueContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import Auth from './components/Auth';
import Home from './components/Home';
import Search from './components/Search';
import ArtistPage from './components/ArtistPage';
import GenrePage from './components/GenrePage';
import MusicLibrary from './components/MusicLibrary';
import PlayerEnhanced from './components/PlayerEnhanced';
import BottomNav from './components/BottomNav';
import QueuePage from './components/QueuePage';

function App() {
  const { session } = useAuth();

  if (!session) {
    return <Auth />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueueProvider>
          <Router>
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div className="mobile-layout">
              <main id="main-content" className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<MusicLibrary />} />
                  <Route path="/artist/:artistId" element={<ArtistPage />} />
                  <Route path="/genres" element={<GenrePage />} />
                  <Route path="/queue" element={<QueuePage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <PlayerEnhanced />
              <BottomNav />
            </div>
          </Router>
        </QueueProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
