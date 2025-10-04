import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { QueueProvider } from './contexts/QueueContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ArtistPage from './components/ArtistPage';
import GenrePage from './components/GenrePage';
import MusicLibrary from './components/MusicLibrary';
import Player from './components/Player';

function App() {
  const { session } = useAuth();

  if (!session) {
    return <Auth />;
  }

  return (
    <QueueProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/artist/:artistId" element={<ArtistPage />} />
          <Route path="/genres" element={<GenrePage />} />
          <Route path="/library" element={<MusicLibrary />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Player />
    </QueueProvider>
  );
}

export default App;
