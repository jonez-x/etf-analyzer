import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Search } from './pages/Search';
import { Compare } from './pages/Compare';
import { SavingsPlan } from './pages/SavingsPlan';
import { ETFDetail } from './pages/ETFDetail';
import './index.css';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/search" element={<Search />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/savings" element={<SavingsPlan />} />
              <Route path="/etf/:symbol" element={<ETFDetail />} />
            </Routes>
          </main>
          <footer className="footer">
            <div className="footer-content">
              <p>
                📈 ETF Analyzer Pro • Daten werden von kostenlosen APIs bereitgestellt
              </p>
              <p className="footer-disclaimer">
                Diese Anwendung dient nur zu Informationszwecken und stellt keine Anlageberatung dar.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
