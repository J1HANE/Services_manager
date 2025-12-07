// src/components/Header.jsx
import React, { useState } from 'react';
import { ArrowLeft, Menu, Bell, ChevronDown, Hammer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  onBack?: () => void;
  showMenu?: boolean;
  showNotifications?: boolean;
  color?: string;
  transparent?: boolean;
}

export function Header({ 
  title, 
  onBack, 
  showMenu = false, 
  showNotifications = false,
  color = '#6B4423',
  transparent = false
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  // Si c'est la landing page (pas de titre spécifié)
  if (!title) {
    return (
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        transparent ? 'bg-transparent' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-orange-700">
                <Hammer className="w-6 h-6 text-white" />
              </div>
              <span className="font-serif text-2xl text-amber-900">ServicePro</span>
            </Link>

            {/* Navigation Desktop */}
            <nav className="items-center hidden gap-6 md:flex">
              <Link to="/" className="transition-colors text-amber-900 hover:text-orange-700">
                Accueil
              </Link>
              
              <div className="relative">
                <button 
                  className="flex items-center gap-1 transition-colors text-amber-900 hover:text-orange-700"
                  onMouseEnter={() => setServicesOpen(true)}
                  onMouseLeave={() => setServicesOpen(false)}
                >
                  Services
                  <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 w-48 py-2 mt-2 bg-white border border-gray-100 rounded-lg shadow-lg top-full"
                    >
                      <a href="#services" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                        Menuiserie
                      </a>
                      <a href="#services" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                        Peinture
                      </a>
                      <a href="#services" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                        Électricité
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a href="#about" className="transition-colors text-amber-900 hover:text-orange-700">
                À propos
              </a>
              <a href="#contact" className="transition-colors text-amber-900 hover:text-orange-700">
                Contact
              </a>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link 
                to="/login" 
                className="px-4 py-2 transition-colors text-amber-900 hover:text-orange-700"
              >
                Connexion
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-lg"
              >
                Commencer
              </Link>
              
              {/* Menu mobile */}
              <button 
                className="md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <Menu className="w-6 h-6 text-amber-900" />
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden bg-white border border-gray-100 rounded-lg shadow-lg md:hidden"
              >
                <div className="py-2">
                  <Link to="/" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                    Accueil
                  </Link>
                  <a href="#services" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                    Services
                  </a>
                  <a href="#about" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                    À propos
                  </a>
                  <a href="#contact" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                    Contact
                  </a>
                  <div className="my-2 border-t"></div>
                  <Link to="/login" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                    Connexion
                  </Link>
                  <Link to="/register" className="block px-4 py-2 text-amber-900 hover:bg-orange-50">
                    Inscription
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
    );
  }

  // Header standard pour les autres pages
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 shadow-sm"
      style={{ backgroundColor: color }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-1">
            <ArrowLeft size={24} className="text-white" />
          </button>
        )}
        {showMenu && (
          <button className="p-1">
            <Menu size={24} className="text-white" />
          </button>
        )}
      </div>
      
      <h1 className="flex-1 text-lg font-medium text-center text-white">{title}</h1>
      
      <div className="flex items-center gap-3">
        {showNotifications && (
          <button className="relative p-1">
            <Bell size={24} className="text-white" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}
        {!showMenu && !showNotifications && <div className="w-6"></div>}
      </div>
    </div>
  );
}