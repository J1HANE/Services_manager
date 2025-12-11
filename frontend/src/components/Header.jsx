// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Plus, User, Shield, ChevronDown, Hammer, Paintbrush, Zap, Menu, X } from 'lucide-react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.98)']
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fermer les menus mobiles quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuOpen && !e.target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <motion.header
      style={{
        opacity: headerOpacity,
        backgroundColor: headerBackground,
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center">
              <Hammer className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl text-amber-900">ServicePro</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Accueil */}
            <Link
              to="/"
              className="flex items-center gap-2 text-amber-900 hover:text-orange-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Accueil</span>
            </Link>



            {/* Services Menu */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className="flex items-center gap-2 text-amber-900 hover:text-orange-700 transition-colors">
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-orange-100 py-2 z-50"
                  >
                    {/* REMPLACEZ les ancres par des liens vers les pages */}
                    <Link
                      to="/menuiserie"
                      className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      <Hammer className="w-4 h-4 text-orange-600" />
                      <span>Menuiserie</span>
                    </Link>
                    <Link
                      to="/peinture"
                      className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      <Paintbrush className="w-4 h-4 text-orange-600" />
                      <span>Peinture</span>
                    </Link>
                    <Link
                      to="/electricite"
                      className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                      onClick={() => setServicesOpen(false)}
                    >
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span>Électricité</span>
                    </Link>
                    {/* Optionnel : Lien vers tous les services */}
                    <div className="border-t border-orange-100 mt-2 pt-2">
                      <Link
                        to="/tous-services"
                        className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                        onClick={() => setServicesOpen(false)}
                      >
                        <span className="text-sm font-semibold">Tous les services</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Plus Menu */}
            <div
              className="relative"
              onMouseEnter={() => setPlusOpen(true)}
              onMouseLeave={() => setPlusOpen(false)}
            >
              <button className="flex items-center gap-2 text-amber-900 hover:text-orange-700 transition-colors">
                <span>Plus</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${plusOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {plusOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-orange-100 py-2 z-50"
                  >
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('auth_token');
                        if (!token) {
                          window.location.href = '/connexion';
                        } else {
                          window.location.href = '/publier-service';
                        }
                        setPlusOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-orange-600" />
                      <span>Publier un Service</span>
                    </button>
                    <Link
                      to="/profil"
                      className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                      onClick={() => setPlusOpen(false)}
                    >
                      <User className="w-4 h-4 text-orange-600" />
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      to="/espace-pro"
                      className="w-full flex items-center gap-3 px-4 py-2 text-amber-900 hover:bg-orange-50 transition-colors"
                      onClick={() => setPlusOpen(false)}
                    >
                      <Shield className="w-4 h-4 text-orange-600" />
                      <span>Espace Pro</span>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/connexion"
              className="px-4 py-2 text-amber-900 hover:text-orange-700 transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/inscription"
              className="px-6 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
            >
              Commencer
            </Link>
          </div>

          {/* Bouton menu mobile */}
          <button
            className="md:hidden"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-amber-900" />
            ) : (
              <Menu className="w-6 h-6 text-amber-900" />
            )}
          </button>
        </div>

        {/* Menu mobile */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mobile-menu-container md:hidden mt-4 overflow-hidden bg-white rounded-lg shadow-lg border border-orange-100"
            >
              <div className="py-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 text-amber-900 hover:bg-orange-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Accueil</span>
                </Link>

                {/* Services dans menu mobile */}
                <div className="px-4 py-3">
                  <div className="text-sm text-amber-700 font-semibold mb-2">Services</div>
                  <div className="space-y-2 pl-4">
                    <a
                      href="#services"
                      className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Hammer className="w-4 h-4" />
                      <span>Menuiserie</span>
                    </a>
                    <a
                      href="#services"
                      className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Paintbrush className="w-4 h-4" />
                      <span>Peinture</span>
                    </a>
                    <a
                      href="#services"
                      className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Électricité</span>
                    </a>
                  </div>
                </div>

                {/* Plus dans menu mobile */}
                <div className="px-4 py-3">
                  <div className="text-sm text-amber-700 font-semibold mb-2">Plus</div>
                  <div className="space-y-2 pl-4">
                    <button
                      onClick={() => {
                        const token = localStorage.getItem('auth_token');
                        if (!token) {
                          window.location.href = '/connexion';
                        } else {
                          window.location.href = '/publier-service';
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700 w-full text-left"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Publier un Service</span>
                    </button>
                    <Link
                      to="/profil"
                      className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      to="/espace-pro"
                      className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4" />
                      <span>Espace Pro</span>
                    </Link>
                  </div>
                </div>

                <div className="my-2 border-t border-orange-100"></div>

                <div className="px-4 py-2">
                  <Link
                    to="/connexion"
                    className="block w-full px-4 py-2 text-center text-amber-900 hover:bg-orange-50 transition-colors rounded-lg mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="block w-full px-4 py-2 text-center bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all shadow-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Commencer
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

export default Header;