// src/pages/ProfilPage.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from '../api/axios';

function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    surnom: '',
    email: '',
    telephone: '',
    photo_profil_url: null,
  });
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const res = await axios.get('/user/profile');
        if (mounted) {
          const u = res.data.user || {};
          // Ensure photo_profil_url is a full URL. If API returns a relative path, build full URL.
          const apiBase = axios.defaults.baseURL || import.meta.env.VITE_API_URL || window.location.origin;
          const origin = (apiBase || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
          if (!u.photo_profil_url) {
            if (u.photo_profil) {
              if (/^https?:\/\//i.test(u.photo_profil)) {
                u.photo_profil_url = u.photo_profil;
              } else if (u.photo_profil.startsWith('/')) {
                u.photo_profil_url = origin + u.photo_profil;
              } else {
                u.photo_profil_url = origin + '/storage/' + u.photo_profil;
              }
            } else {
              u.photo_profil_url = null;
            }
          }
          setUser(u);
        }
      } catch (err) {
        console.error('Erreur en récupérant le profil', err);
        alert(err.response?.data?.message || 'Impossible de charger le profil');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    // revoke previous preview URL to avoid memory leaks
    if (photoPreview) {
      try { URL.revokeObjectURL(photoPreview); } catch (e) { /* ignore */ }
    }
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let res;

      const hasFile = !!photoFile;
      if (hasFile) {
        const form = new FormData();
        form.append('nom', user.nom || '');
        form.append('prenom', user.prenom || '');
        form.append('surnom', user.surnom || '');
        form.append('email', user.email || '');
        form.append('telephone', user.telephone || '');
        form.append('photo_profil', photoFile);
        if (password) {
          form.append('mot_de_passe', password);
          form.append('mot_de_passe_confirmation', passwordConfirm);
        }

        res = await axios.put('/user/profile', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        const payload = {
          nom: user.nom,
          prenom: user.prenom,
          surnom: user.surnom,
          email: user.email,
          telephone: user.telephone,
        };
        if (password) {
          payload.mot_de_passe = password;
          payload.mot_de_passe_confirmation = passwordConfirm;
        }
        res = await axios.put('/user/profile', payload);
      }

      alert(res.data.message || 'Profil mis à jour');
      const newUser = res.data.user || user;
      // If API returned a photo path or URL, ensure we have a full photo_profil_url
      const apiBase = axios.defaults.baseURL || import.meta.env.VITE_API_URL || window.location.origin;
      const origin = (apiBase || '').replace(/\/api\/?$/, '').replace(/\/$/, '');
      if (res.data.user) {
        if (res.data.user.photo_profil_url) {
          newUser.photo_profil_url = res.data.user.photo_profil_url;
        } else if (res.data.user.photo_profil) {
          const p = res.data.user.photo_profil;
          if (/^https?:\/\//i.test(p)) newUser.photo_profil_url = p;
          else if (p.startsWith('/')) newUser.photo_profil_url = origin + p;
          else newUser.photo_profil_url = origin + '/storage/' + p;
        } else if (photoPreview) {
          // Backend did not return a path/url but we have a local preview -> use it so image appears immediately
          newUser.photo_profil_url = photoPreview;
        }
      } else if (photoPreview) {
        // No user returned but we have preview
        newUser.photo_profil_url = photoPreview;
      }
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(res.data.user || user));
      setPassword('');
      setPasswordConfirm('');
      // clean up preview URL
      if (photoPreview) {
        try { URL.revokeObjectURL(photoPreview); } catch (e) { /* ignore */ }
      }
      setPhotoFile(null);
      setPhotoPreview(null);
      setEditing(false);
    } catch (err) {
      console.error('Erreur mise à jour profil', err);
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <Header />
      <div className="flex-grow flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden">
              {/* Header Section avec image de fond */}
              <div className="relative h-48 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -bottom-16 left-8 z-10">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-xl">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                      ) : user.photo_profil_url ? (
                        <img src={user.photo_profil_url} alt="Photo profil" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold">
                          {(user.prenom || '').charAt(0)}{(user.nom || '').charAt(0)}
                        </div>
                      )}
                    </div>
                    {editing && (
                      <label className="absolute bottom-0 right-0 bg-amber-700 hover:bg-amber-800 text-white rounded-full p-2 cursor-pointer shadow-lg transition-all transform hover:scale-110">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <div className="absolute top-6 right-6 z-10">
                  {!editing ? (
                    <button 
                      onClick={() => setEditing(true)} 
                      className="px-6 py-2.5 bg-white text-amber-700 rounded-full font-semibold hover:bg-amber-50 shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Modifier
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setEditing(false); setPhotoFile(null); setPhotoPreview(null); }} 
                      className="px-6 py-2.5 bg-white/90 text-gray-700 rounded-full font-semibold hover:bg-white shadow-lg transition-all flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Annuler
                    </button>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <div className="pt-20 px-8 pb-8">
                {!editing ? (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{user.prenom} {user.nom}</h1>
                      <p className="text-sm text-gray-600 mt-1">Role: <span className="font-medium text-amber-700">{user.role}</span></p>
                      <div className="flex items-center gap-3 mt-2">
                        {user.est_verifie ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">Vérifié</span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded">Non vérifié</span>
                        )}
                        {user.is_banned && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded">Banni</span>
                        )}
                        {typeof user.note_moyenne !== 'undefined' && (
                          <span className="px-2 py-1 bg-amber-50 text-amber-800 text-sm font-medium rounded">{user.note_moyenne} ★ ({user.nb_avis || 0})</span>
                        )}
                      </div>
                      {user.surnom && (
                        <p className="text-lg text-amber-700 font-medium mt-1">"{user.surnom}"</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-amber-700 rounded-lg p-2">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</p>
                            <p className="text-gray-900 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-amber-700 rounded-lg p-2">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Téléphone</p>
                            <p className="text-gray-900 font-medium">{user.telephone || 'Non renseigné'}</p>
                          </div>
                        </div>
                      </div>
                      {/* Role card removed here (role already displayed at top) */}
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                      <Link to="/" className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour à l'accueil
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Prénom</label>
                        <input 
                          name="prenom" 
                          value={user.prenom || ''} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">Nom</label>
                        <input 
                          name="nom" 
                          value={user.nom || ''} 
                          onChange={handleChange} 
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Surnom</label>
                      <input 
                        name="surnom" 
                        value={user.surnom || ''} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="Votre surnom (optionnel)"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Email</label>
                      <input 
                        name="email" 
                        value={user.email || ''} 
                        onChange={handleChange} 
                        type="email" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="votre.email@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Téléphone</label>
                      <input 
                        name="telephone" 
                        value={user.telephone || ''} 
                        onChange={handleChange} 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        placeholder="+212 6XX XXX XXX"
                      />
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Changer le mot de passe</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Nouveau mot de passe</label>
                          <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-semibold text-gray-700">Confirmer mot de passe</label>
                          <input 
                            type="password" 
                            value={passwordConfirm} 
                            onChange={(e) => setPasswordConfirm(e.target.value)} 
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                      <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Retour
                      </Link>
                      <button 
                        type="submit" 
                        disabled={saving} 
                        className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-semibold hover:from-amber-700 hover:to-orange-700 shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Enregistrer les modifications
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ProfilPage;