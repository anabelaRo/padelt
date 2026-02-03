import TournamentCreator from './pages/TournamentCreator';
import TournamentDetail from './pages/TournamentDetail';

// Dentro de tu <Routes>
<Route path="/tournaments/new" element={<TournamentCreator />} />
<Route path="/tournament/:id" element={<TournamentDetail />} />
