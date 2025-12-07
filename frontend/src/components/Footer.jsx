// src/components/Footer.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Shield, Hammer } from 'lucide-react';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="px-4 py-12 text-white bg-amber-900 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Hammer className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl">ServicePro</span>
            </div>
            <p className="text-white/80">
              La plateforme de confiance pour trouver les meilleurs professionnels.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-lg">Services</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <a href="#services" className="transition-colors hover:text-white">
                  Menuiserie
                </a>
              </li>
              <li>
                <a href="#services" className="transition-colors hover:text-white">
                  Peinture
                </a>
              </li>
              <li>
                <a href="#services" className="transition-colors hover:text-white">
                  Électricité
                </a>
              </li>
              <li>
                <a href="#services" className="transition-colors hover:text-white">
                  Plomberie
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg">À Propos</h4>
            <ul className="space-y-2 text-white/80">
              <li>
                <a href="#about" className="transition-colors hover:text-white">
                  Notre mission
                </a>
              </li>
              <li>
                <a href="#values" className="transition-colors hover:text-white">
                  Nos valeurs
                </a>
              </li>
              <li>
                <a href="#testimonials" className="transition-colors hover:text-white">
                  Témoignages
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-white">
                  Carrières
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg">Contact & Support</h4>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Support 24/7</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>100% Sécurisé</span>
              </li>
              <li className="mt-4">
                <p className="text-sm">Email : contact@servicepro.com</p>
              </li>
              <li>
                <p className="text-sm">Tél : +33 1 23 45 67 89</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/20">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <p className="text-white/80">
                &copy; 2025 ServicePro. Tous droits réservés.
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                Confidentialité
              </a>
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                CGU
              </a>
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                Cookies
              </a>
              <a href="#" className="transition-colors text-white/80 hover:text-white">
                Mentions légales
              </a>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-white/60">
              ServicePro est une plateforme de mise en relation entre clients et professionnels du bâtiment.
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}