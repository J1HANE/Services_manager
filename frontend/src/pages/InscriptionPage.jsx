// src/pages/InscriptionPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCircle, Briefcase, Hammer } from 'lucide-react';

function InscriptionPage() {
  const [step, setStep] = useState('role');
  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    console.log('Inscription:', { role, ...formData });
    // Logique d'inscription ici
  };

  const handleGoogleSignup = () => {
    console.log('Inscription avec Google');
    // Logique d'inscription Google ici
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-amber-900 via-orange-900 to-green-900" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            {/* Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-700 via-orange-800 to-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Hammer className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl text-amber-900 mb-2">
                  {step === 'role' ? 'Choisissez votre profil' : 'Inscription'}
                </h1>
                <p className="text-amber-700">
                  {step === 'role' 
                    ? 'Sélectionnez le type de compte que vous souhaitez créer'
                    : `Créer votre compte ${role === 'client' ? 'Client' : 'Intervenant'}`
                  }
                </p>
              </div>

              {/* Étape 1: Choix du rôle */}
              {step === 'role' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Client */}
                  <button
                    onClick={() => handleRoleSelect('client')}
                    className="p-8 border-3 border-amber-200 rounded-2xl hover:border-amber-700 hover:shadow-xl transition-all group bg-white"
                  >
                    <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                      <UserCircle className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-2xl text-amber-900 mb-2">Client</h3>
                    <p className="text-amber-700">
                      Je recherche des professionnels pour mes projets
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-amber-700 text-left">
                      <li>✓ Trouver des intervenants</li>
                      <li>✓ Gérer vos demandes</li>
                      <li>✓ Évaluer les services</li>
                    </ul>
                  </button>

                  {/* Intervenant */}
                  <button
                    onClick={() => handleRoleSelect('intervenant')}
                    className="p-8 border-3 border-amber-200 rounded-2xl hover:border-amber-700 hover:shadow-xl transition-all group bg-white"
                  >
                    <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                      <Briefcase className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="text-2xl text-amber-900 mb-2">Intervenant</h3>
                    <p className="text-amber-700">
                      Je propose mes services professionnels
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-amber-700 text-left">
                      <li>✓ Publier vos services</li>
                      <li>✓ Gérer vos interventions</li>
                      <li>✓ Développer votre activité</li>
                    </ul>
                  </button>
                </div>
              )}

              {/* Étape 2: Formulaire d'inscription */}
              {step === 'form' && (
                <>
                  {/* Bouton retour */}
                  <button
                    onClick={() => setStep('role')}
                    className="mb-6 text-amber-800 hover:text-amber-900 flex items-center gap-2 font-semibold"
                  >
                    ← Changer de profil
                  </button>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom et Prénom */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">Nom</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            placeholder="Dupont"
                            className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-amber-900 mb-2 font-semibold">Prénom</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                          <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                            placeholder="Jean"
                            className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.dupont@example.com"
                          className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          placeholder="06 12 34 56 78"
                          className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                          required
                        />
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-amber-700 mt-1">Au moins 8 caractères</p>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div>
                      <label className="block text-amber-900 mb-2 font-semibold">Confirmer le mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full pl-12 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Bouton d'inscription */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-amber-700 via-orange-800 to-green-900 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                    >
                      S'inscrire
                    </button>
                  </form>

                  {/* Séparateur */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-amber-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-amber-700">Ou continuer avec</span>
                    </div>
                  </div>

                  {/* Inscription Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full py-3 border-2 border-amber-300 rounded-lg hover:bg-amber-50 transition-colors flex items-center justify-center gap-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-amber-900 font-semibold">S'inscrire avec Google</span>
                  </button>

                  {/* Lien vers connexion */}
                  <div className="mt-8 text-center">
                    <p className="text-amber-800">
                      Déjà un compte ?{' '}
                      <Link
                        to="/connexion"
                        className="text-amber-900 hover:text-orange-800 font-semibold underline"
                      >
                        Se connecter
                      </Link>
                    </p>
                    <p className="mt-4 text-amber-800">
                      <Link
                        to="/"
                        className="text-amber-900 hover:text-orange-800 font-semibold"
                      >
                        ← Retour à l'accueil
                      </Link>
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default InscriptionPage;