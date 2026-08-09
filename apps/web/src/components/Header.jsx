import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ArrowRight } from 'lucide-react';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { label: 'PRODUCTEN', path: '/producten' },
    { label: 'DIENSTEN', path: '/diensten' },
    { label: 'REALISATIES', path: '/realisaties' },
    { label: 'CONTACT', path: '/contact' },
    { label: 'OVER ONS', path: '/over-ons' },
  ];

  return (
    <>
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-sm' : 'bg-background'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="text-2xl font-semibold tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                'T PALLETJE
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-semibold tracking-wider transition-all duration-200 hover:text-primary ${
                    location.pathname === link.path ? 'text-primary' : 'text-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <a 
                href="tel:+32499196802"
                className="hidden md:flex items-center gap-2 text-sm font-semibold text-foreground transition-all duration-200 hover:text-primary"
              >
                <Phone className="w-4 h-4" />
                0499 19 68 02
              </a>
              <a href="https://configurator.palletje.be/" className="hidden md:inline-flex btn-primary">
                Vraag een offerte
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-foreground transition-all duration-200 hover:text-primary"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-card shadow-2xl transform transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6 pt-24">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-lg font-semibold tracking-wide transition-all duration-200 hover:text-primary ${
                  location.pathname === link.path ? 'text-primary' : 'text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 pt-8 border-t border-border">
            <a 
              href="tel:+32499196802"
              className="flex items-center gap-3 text-base font-semibold text-foreground mb-6 transition-all duration-200 hover:text-primary"
            >
              <Phone className="w-5 h-5" />
              0499 19 68 02
            </a>
            <a href="https://configurator.palletje.be/" className="btn-primary w-full justify-center">
              Vraag een offerte
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}

export default Header;