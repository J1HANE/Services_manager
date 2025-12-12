// src/App.jsx
import React from 'react';
import 'leaflet/dist/leaflet.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importez les composants pour les routes inline
import { Header } from './components/Header';
import Footer from './components/Footer';
import { Link } from 'react-router-dom';

// Pages principales
import LandingPage from './pages/LandingPage';
import ConnexionPage from './pages/ConnexionPage';
import InscriptionPage from './pages/InscriptionPage';
import ServiceWizardPage from './pages/ServiceWizardPage';
import EspaceProPage from './pages/EspaceProPage';
import DemanderServicePage from './pages/DemanderServicePage';
import MesDemandesPage from './pages/MesDemandesPage';

// Admin pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminDemandesPage from './pages/admin/AdminDemandesPage';
import AdminEvaluationsPage from './pages/admin/AdminEvaluationsPage';
import AdminDocumentsPage from './pages/admin/AdminDocumentsPage';

// Pages de recherche d'intervenants
import RechercheIntervenantsPage from './pages/RechercheIntervenantsPage';
import MenuiseriePage from './pages/MenuiseriePage';
import PeinturePage from './pages/PeinturePage';
import ElectricitePage from './pages/ElectricitePage';
import TousServicesPage from './pages/TousServicesPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages principales */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/connexion" element={<ConnexionPage />} />
        <Route path="/inscription" element={<InscriptionPage />} />
        <Route path="/publier-service" element={<ServiceWizardPage />} />
        
        {/* Pages de recherche d'intervenants */}
        <Route path="/recherche-intervenants" element={<RechercheIntervenantsPage />} />
        <Route path="/menuiserie" element={<MenuiseriePage />} />
        <Route path="/peinture" element={<PeinturePage />} />
        <Route path="/electricite" element={<ElectricitePage />} />
        <Route path="/tous-services" element={<TousServicesPage />} />
        
        {/* Admin */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/utilisateurs" element={<AdminUsersPage />} />
        <Route path="/admin/services" element={<AdminServicesPage />} />
        <Route path="/admin/demandes" element={<AdminDemandesPage />} />
        <Route path="/admin/evaluations" element={<AdminEvaluationsPage />} />
        <Route path="/admin/documents" element={<AdminDocumentsPage />} />
        
        <Route path="/espace-pro" element={<EspaceProPage />} />
        <Route path="/demander-service/:serviceId" element={<DemanderServicePage />} />
        <Route path="/mes-demandes" element={<MesDemandesPage />} />
        
        {/* Route 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col">
            <Header />
            <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
                <p className="text-xl text-gray-700 mb-6">Page non trouvée</p>
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700"
                >
                  Retour à l'accueil
                </Link>
              </div>
            </div>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
