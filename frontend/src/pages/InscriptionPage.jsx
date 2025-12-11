// src/pages/InscriptionPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCircle, Briefcase, Hammer } from 'lucide-react';
import API from '../api/axios';


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

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert('Les mots de passe ne correspondent pas');
    return;
  }

  try {
    const response = await API.post('/register', {
      role,
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      password: formData.password,
      password_confirmation: formData.confirmPassword,
    });

    console.log('Success:', response.data);
    alert('Inscription réussie !');
    // Redirect user to login
    // e.g., navigate('/connexion');
  } catch (error) {
    console.error(error.response?.data || error.message);
    alert(
      error.response?.data?.message || 'Erreur lors de l\'inscription'
    );
  }
};




  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-amber-900 via-orange-900 to-green-900" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="px-4 pt-32 pb-12">
          <div className="max-w-2xl mx-auto">
            {/* Card */}
            <div className="p-8 shadow-2xl bg-white/95 backdrop-blur-sm rounded-2xl">
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 shadow-lg bg-gradient-to-br from-amber-700 via-orange-800 to-green-900 rounded-2xl">
                  <Hammer className="w-10 h-10 text-white" />
                </div>
                <h1 className="mb-2 text-4xl text-amber-900">
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
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Client */}
                  <button
                    onClick={() => handleRoleSelect('client')}
                    className="p-8 transition-all bg-white border-3 border-amber-200 rounded-2xl hover:border-amber-700 hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 transition-colors bg-blue-100 rounded-2xl group-hover:bg-blue-200">
                      <UserCircle className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="mb-2 text-2xl text-amber-900">Client</h3>
                    <p className="text-amber-700">
                      Je recherche des professionnels pour mes projets
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-left text-amber-700">
                      <li>✓ Trouver des intervenants</li>
                      <li>✓ Gérer vos demandes</li>
                      <li>✓ Évaluer les services</li>
                    </ul>
                  </button>

                  {/* Intervenant */}
                  <button
                    onClick={() => handleRoleSelect('intervenant')}
                    className="p-8 transition-all bg-white border-3 border-amber-200 rounded-2xl hover:border-amber-700 hover:shadow-xl group"
                  >
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 transition-colors bg-orange-100 rounded-2xl group-hover:bg-orange-200">
                      <Briefcase className="w-10 h-10 text-orange-600" />
                    </div>
                    <h3 className="mb-2 text-2xl text-amber-900">Intervenant</h3>
                    <p className="text-amber-700">
                      Je propose mes services professionnels
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-left text-amber-700">
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
                    className="flex items-center gap-2 mb-6 font-semibold text-amber-800 hover:text-amber-900"
                  >
                    ← Changer de profil
                  </button>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nom et Prénom */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 font-semibold text-amber-900">Nom</label>
                        <div className="relative">
                          <User className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                          <input
                            type="text"
                            value={formData.nom}
                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            placeholder="Dupont"
                            className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 font-semibold text-amber-900">Prénom</label>
                        <div className="relative">
                          <User className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                          <input
                            type="text"
                            value={formData.prenom}
                            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                            placeholder="Jean"
                            className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">Email</label>
                      <div className="relative">
                        <Mail className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jean.dupont@example.com"
                          className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                        />
                      </div>
                    </div>

                    {/* Téléphone */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          placeholder="06 12 34 56 78"
                          className="w-full py-3 pl-12 pr-4 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                        />
                      </div>
                    </div>

                    {/* Mot de passe */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">Mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full py-3 pl-12 pr-12 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute transform -translate-y-1/2 right-4 top-1/2 text-amber-600 hover:text-amber-800"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-amber-700">Au moins 8 caractères</p>
                    </div>

                    {/* Confirmer mot de passe */}
                    <div>
                      <label className="block mb-2 font-semibold text-amber-900">Confirmer le mot de passe</label>
                      <div className="relative">
                        <Lock className="absolute w-5 h-5 transform -translate-y-1/2 left-4 top-1/2 text-amber-600" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          className="w-full py-3 pl-12 pr-12 transition-colors bg-white border-2 rounded-lg border-amber-200 focus:outline-none focus:border-amber-700"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute transform -translate-y-1/2 right-4 top-1/2 text-amber-600 hover:text-amber-800"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Bouton d'inscription */}
                    <button
                      type="submit"
                      className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-amber-700 via-orange-800 to-green-900 hover:shadow-xl"
                    >
                      S'inscrire
                    </button>
                  </form>

                
                  

                  {/* Lien vers connexion */}
                  <div className="mt-8 text-center">
                    <p className="text-amber-800">
                      Déjà un compte ?{' '}
                      <Link
                        to="/connexion"
                        className="font-semibold underline text-amber-900 hover:text-orange-800"
                      >
                        Se connecter
                      </Link>
                    </p>
                    <p className="mt-4 text-amber-800">
                      <Link
                        to="/"
                        className="font-semibold text-amber-900 hover:text-orange-800"
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