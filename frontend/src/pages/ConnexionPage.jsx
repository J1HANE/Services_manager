// src/pages/ConnexionPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header'; // Note: si c'est un export nommé
import Footer from '../components/Footer';
import { Mail, Lock, Eye, EyeOff, Hammer } from 'lucide-react';

function ConnexionPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // CORRECTION ICI : Supprimez l'annotation TypeScript
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique de connexion ici
    console.log('Connexion avec:', email, password);
  };

  const handleGoogleLogin = () => {
    // Logique de connexion Google ici
    console.log('Connexion avec Google');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-amber-900 via-orange-900 to-green-900" style={{ fontFamily: 'Times New Roman, serif' }}>
        <div className="pt-32 pb-12 px-4">
          <div className="max-w-md mx-auto">
            {/* Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-700 via-orange-800 to-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Hammer className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl text-amber-900 mb-2">Connexion</h1>
                <p className="text-amber-700">Bienvenue sur ServicePro</p>
              </div>

              {/* Formulaire */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label className="block text-amber-900 mb-2 font-semibold">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-12 pr-12 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-700 transition-colors bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600 hover:text-amber-800"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Mot de passe oublié */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-amber-800 hover:text-amber-900 text-sm font-semibold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Bouton de connexion */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-700 via-orange-800 to-green-900 text-white rounded-lg hover:shadow-xl transition-all font-semibold"
                >
                  Se connecter
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

              {/* Connexion Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
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
                <span className="text-amber-900 font-semibold">Connexion avec Google</span>
              </button>

              {/* Lien vers inscription */}
              <div className="mt-8 text-center">
                <p className="text-amber-800">
                  Pas encore de compte ?{' '}
                  <Link
                    to="/inscription"
                    className="text-amber-900 hover:text-orange-800 font-semibold underline"
                  >
                    S'inscrire
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
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ConnexionPage;