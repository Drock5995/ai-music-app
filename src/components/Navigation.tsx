import { NavLink } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav style={{ padding: '1rem', backgroundColor: '#121212', display: 'flex', gap: '1rem' }}>
      <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#1DB954' : '#b3b3b3' })}>
        Dashboard
      </NavLink>
      <NavLink to="/library" style={({ isActive }) => ({ color: isActive ? '#1DB954' : '#b3b3b3' })}>
        Music Library
      </NavLink>
      <NavLink to="/genres" style={({ isActive }) => ({ color: isActive ? '#1DB954' : '#b3b3b3' })}>
        Genres
      </NavLink>
    </nav>
  );
}
