import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductenPage from './pages/ProductenPage.jsx';
import DienstenPage from './pages/DienstenPage.jsx';
import RealisatiePage from './pages/RealisatiePage.jsx';
import OverOnsPage from './pages/OverOnsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/producten" element={<ProductenPage />} />
        <Route path="/diensten" element={<DienstenPage />} />
        <Route path="/realisaties" element={<RealisatiePage />} />
        <Route path="/over-ons" element={<OverOnsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </Router>
  );
}

export default App;
