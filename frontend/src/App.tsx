import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout';
import {
  Dashboard,
  Market,
  Trading,
  QScore,
  Portfolio,
  Transactions,
  Agent,
  Settings,
} from './pages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<Market />} />
          <Route path="/trading" element={<Trading />} />
          <Route path="/qscore" element={<QScore />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/agent" element={<Agent />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
