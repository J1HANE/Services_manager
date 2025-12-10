// src/pages/ProfilPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ProfilPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-amber-900 mb-4">Mon Profil</h1>
          <p className="text-gray-600 mb-6">Page en construction</p>
          <Link 
            to="/" 
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilPage;