// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Plus, User, Shield, ChevronDown, Hammer, Paintbrush, Zap, Menu, X } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLimited = ['/', '/inscription', '/connexion'].includes(location.pathname);

  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
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

  // Lire l'utilisateur stocké pour afficher la session/déconnexion
  useEffect(() => {
    const readUser = () => {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          setCurrentUser(JSON.parse(saved));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };

    readUser();
    const onStorage = () => readUser();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    navigate('/connexion');
  };

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
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 text-black ${
        scrolled ? 'shadow-lg' : ''
      }`}
    >
      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700">
              <Hammer className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl text-black">ServicePro</span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="items-center hidden gap-6 md:flex">
            <Link
              to="/"
              className="flex items-center gap-2 transition-colors text-amber-900 hover:text-orange-700"
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
              <button className="flex items-center gap-2 transition-colors text-amber-900 hover:text-orange-700">
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
                    className="absolute left-0 z-50 w-48 py-2 mt-2 bg-white border border-orange-100 rounded-lg shadow-xl top-full"
                  >
                    <Link
                      to="/menuiserie"
                      className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                      onClick={() => setServicesOpen(false)}
                    >
                      <Hammer className="w-4 h-4 text-orange-600" />
                      <span>Menuiserie</span>
                    </Link>
                    <Link
                      to="/peinture"
                      className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                      onClick={() => setServicesOpen(false)}
                    >
                      <Paintbrush className="w-4 h-4 text-orange-600" />
                      <span>Peinture</span>
                    </Link>
                    <Link
                      to="/electricite"
                      className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                      onClick={() => setServicesOpen(false)}
                    >
                      <Zap className="w-4 h-4 text-orange-600" />
                      <span>Électricité</span>
                    </Link>
                    <div className="pt-2 mt-2 border-t border-orange-100">
                      <Link
                        to="/tous-services"
                        className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
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
              <button className="flex items-center gap-2 text-black transition-colors hover:text-orange-700">
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
                    className="absolute left-0 z-50 w-56 py-2 mt-2 bg-white border border-orange-100 rounded-lg shadow-xl top-full"
                  >
                    {isLimited ? (
                      <Link
                        to="/espace-pro"
                        className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                        onClick={() => setPlusOpen(false)}
                      >
                        <Shield className="w-4 h-4 text-orange-600" />
                        <span>Espace Pro</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/publier-service"
                          className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                          onClick={() => setPlusOpen(false)}
                        >
                          <Plus className="w-4 h-4 text-orange-600" />
                          <span>Publier un Service</span>
                        </Link>
                        <Link
                          to="/profil"
                          className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                          onClick={() => setPlusOpen(false)}
                        >
                          <User className="w-4 h-4 text-orange-600" />
                          <span>Mon profil</span>
                        </Link>
                        <Link
                          to="/espace-pro"
                          className="flex items-center w-full gap-3 px-4 py-2 transition-colors text-amber-900 hover:bg-orange-50"
                          onClick={() => setPlusOpen(false)}
                        >
                          <Shield className="w-4 h-4 text-orange-600" />
                          <span>Espace Pro</span>
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Actions */}
          <div className="items-center hidden gap-3 md:flex">
            {currentUser ? (
              <>
                <span className="text-sm text-amber-900">
                  Bonjour, {currentUser.prenom || currentUser.nom || currentUser.email}
                </span>
                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-black transition-colors hover:text-orange-700"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-black transition-colors hover:text-orange-700"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/connexion"
                  className="px-4 py-2 text-black transition-colors hover:text-orange-700"
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="px-6 py-2 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg"
                >
                  Commencer
                </Link>
              </>
            )}
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
              className="mt-4 overflow-hidden bg-white border border-orange-100 rounded-lg shadow-lg mobile-menu-container md:hidden"
            >
              <div className="py-2">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-3 transition-colors text-amber-900 hover:bg-orange-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5" />
                  <span>Accueil</span>
                </Link>

                {/* Plus (mobile) : Admin link */}
                {currentUser?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 transition-colors text-amber-900 hover:bg-orange-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Services dans menu mobile */}
                <div className="px-4 py-3">
                  <div className="mb-2 text-sm font-semibold text-amber-700">Services</div>
                  <div className="pl-4 space-y-2">
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
                  <div className="mb-2 text-sm font-semibold text-amber-700">Plus</div>
                  <div className="pl-4 space-y-2">
                    {isLimited ? (
                      <Link
                        to="/espace-pro"
                        className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Shield className="w-4 h-4" />
                        <span>Espace Pro</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/publier-service"
                          className="flex items-center gap-3 py-2 text-amber-900 hover:text-orange-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Plus className="w-4 h-4" />
                          <span>Publier un Service</span>
                        </Link>
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
                      </>
                    )}
                  </div>
                </div>

                <div className="my-2 border-t border-orange-100"></div>

                <div className="px-4 py-2">
                  {currentUser ? (
                    <>
                      <div className="mb-2 text-sm text-amber-900">
                        Bonjour, {currentUser.prenom || currentUser.nom || currentUser.email}
                      </div>
                      <button
                        className="block w-full px-4 py-2 text-center transition-colors rounded-lg text-amber-900 hover:bg-orange-50"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/connexion"
                        className="block w-full px-4 py-2 mb-2 text-center transition-colors rounded-lg text-amber-900 hover:bg-orange-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/inscription"
                        className="block w-full px-4 py-2 text-center text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Commencer
                      </Link>
                    </>
                  )}
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
