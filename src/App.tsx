import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TournamentCreator from './pages/TournamentCreator';
import TournamentDetail from './pages/TournamentDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tournaments/new" element={<TournamentCreator />} />
          <Route path="tournament/:id" element={<TournamentDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;