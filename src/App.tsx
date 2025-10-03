import './App.css';
import { useAuth } from './hooks/useAuth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function App() {
  const { session } = useAuth();

  return (
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      {!session ? <Auth /> : <Dashboard key={session.user.id} />}
    </div>
  );
}

export default App;