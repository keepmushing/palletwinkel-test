import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <div>
            <span className="text-3xl font-semibold tracking-wider mb-6 block" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              'T PALLETJE
            </span>
            <div className="space-y-4 text-sm leading-relaxed opacity-90">
              <div>
                <p className="font-semibold mb-1">Atelier</p>
                <p>Waregemseweg 156</p>
                <p>8750 Wingene, West-Vlaanderen</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Maatschappelijke zetel</p>
                <p>Waregemseweg 156</p>
                <p>8750 Wingene, West-Vlaanderen</p>
              </div>
              <p>BE 0123.456.789</p>
              <p className="pt-4 text-xs opacity-75">© 2026 't Palletje. Alle rechten voorbehouden.</p>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <p className="font-semibold mb-4 tracking-wide">MENU</p>
            <nav className="flex flex-col gap-3">
              <Link to="/" className="text-sm opacity-90 transition-opacity duration-200 hover:opacity-100">
                Home
              </Link>
              <Link to="/producten" className="text-sm opacity-90 transition-opacity duration-200 hover:opacity-100">
                Producten
              </Link>
              <Link to="/diensten" className="text-sm opacity-90 transition-opacity duration-200 hover:opacity-100">
                Diensten
              </Link>
              <Link to="/realisaties" className="text-sm opacity-90 transition-opacity duration-200 hover:opacity-100">
                Realisaties
              </Link>
              <Link to="/over-ons" className="text-sm opacity-90 transition-opacity duration-200 hover:opacity-100">
                Over ons
              </Link>
              <Link to="/contact" className="text-sm opacity-90 transition-opacity duration-200 hover:opacity-100">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;