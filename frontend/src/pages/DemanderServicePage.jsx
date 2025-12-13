import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';
import API from '../api/axios';
import { 
  ArrowLeft, Calendar, FileText, Package, 
  CheckCircle, XCircle, Loader, AlertCircle, DollarSign
} from 'lucide-react';

export default function DemanderServicePage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  // New schema: a service offer already targets ONE sub-service, so request is "libre" (description) against that offer.
  const [typeDemande, setTypeDemande] = useState('libre');
  const [description, setDescription] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [profileAdresse, setProfileAdresse] = useState('');
  const [profileVille, setProfileVille] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [dateSouhaitee, setDateSouhaitee] = useState('');
  const [prixEstime, setPrixEstime] = useState('');

  // Pricing inputs for estimation
  const [baseQuantite, setBaseQuantite] = useState('1');
  const [selectedOptions, setSelectedOptions] = useState({}); // key: `${group}::${nom}` => { group, nom, quantite }
  const [preferredBois, setPreferredBois] = useState('');
  const [selectedFinitions, setSelectedFinitions] = useState({}); // nom -> boolean

  const parseJsonMaybe = (v) => {
    if (v === null || v === undefined) return v;
    if (typeof v !== 'string') return v;
    try {
      return JSON.parse(v);
    } catch {
      return v;
    }
  };

  // Local date helpers (avoid UTC shifting issues with "YYYY-MM-DD")
  const toYmdLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const fromYmdLocal = (ymd) => {
    if (!ymd || typeof ymd !== 'string') return null;
    const [y, m, d] = ymd.split('-').map((x) => parseInt(x, 10));
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  const normalizeService = (svc) => {
    if (!svc || typeof svc !== 'object') return svc;
    const psRaw = svc.parametres_specifiques;
    const psParsed = parseJsonMaybe(psRaw);
    const ps = (psParsed && typeof psParsed === 'object' && !Array.isArray(psParsed)) ? psParsed : null;

    if (!ps) return { ...svc, parametres_specifiques: null };

    // Accept both keys from older payloads: options_pricing (preferred) or optionsPricing
    const opRaw = ps.options_pricing ?? ps.optionsPricing ?? null;
    const opParsed = parseJsonMaybe(opRaw);
    const op = (opParsed && typeof opParsed === 'object' && !Array.isArray(opParsed)) ? opParsed : null;

    return {
      ...svc,
      parametres_specifiques: {
        ...ps,
        options_pricing: op,
      },
    };
  };
  
  useEffect(() => {
    // Vérifier que l'utilisateur est connecté
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || user.role !== 'client') {
      alert('Vous devez être connecté en tant que client pour faire une demande.');
      navigate('/connexion');
      return;
    }
    
    // Charger les détails du service
    const fetchService = async () => {
      try {
        const res = await API.get(`/search?service_id=${serviceId}`);
        if (res.data && res.data.data && res.data.data.length > 0) {
          setService(normalizeService(res.data.data[0]));
        } else if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setService(normalizeService(res.data[0]));
        } else {
          setError('Service non trouvé');
        }
      } catch (err) {
        console.error('Error fetching service:', err);
        setError('Erreur lors du chargement du service');
      } finally {
        setLoading(false);
      }
    };

    // Charger le profil client (adresse/ville)
    const fetchMe = async () => {
      try {
        const me = await API.get('/me');
        const u = me.data?.user || me.data;
        if (u?.adresse) setProfileAdresse(u.adresse);
        if (u?.ville) setProfileVille(u.ville);
        if (useProfileAddress) {
          if (u?.adresse) setAdresse(u.adresse);
          if (u?.ville) setVille(u.ville);
        }
      } catch (e) {
        // fallback to localStorage user if present
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        if (u?.adresse) setProfileAdresse(u.adresse);
        if (u?.ville) setProfileVille(u.ville);
        if (useProfileAddress) {
          if (u?.adresse) setAdresse(u.adresse);
          if (u?.ville) setVille(u.ville);
        }
      }
    };
    
    if (serviceId) {
      fetchMe();
      fetchService();
    }
  }, [serviceId, navigate]);

  // Keep demande address synced when "use profile address" is enabled
  useEffect(() => {
    if (!useProfileAddress) return;
    if (profileAdresse) setAdresse(profileAdresse);
    if (profileVille) setVille(profileVille);
  }, [useProfileAddress, profileAdresse, profileVille]);

  // Normalize availability days to integers 1..7 (backend may send strings)
  const availableDays = useMemo(() => {
    const raw = Array.isArray(service?.disponibilites) ? service.disponibilites : [];
    return raw
      .map((d) => parseInt(d, 10))
      .filter((d) => Number.isFinite(d) && d >= 1 && d <= 7);
  }, [service?.disponibilites]);
  const availableDates = (() => {
    if (!availableDays.length) return [];
    const out = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // next 45 days
    for (let i = 1; i <= 45; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // JS: 0=Sun..6=Sat; we use 1=Mon..7=Sun
      const iso = d.getDay() === 0 ? 7 : d.getDay();
      if (availableDays.includes(iso)) {
        out.push(d);
      }
    }
    return out;
  })();
  
  
  // Validation du formulaire
  const validateForm = () => {
    if (!adresse.trim()) {
      setError('L\'adresse est requise');
      return false;
    }
    if (!ville.trim()) {
      setError('La ville est requise');
      return false;
    }
    if (!description.trim()) {
      setError('La description est requise');
      return false;
    }

    // If service has a base unit that requires quantity, enforce a valid base quantity
    if (service && ['par_heure', 'par_m2', 'par_unite'].includes(service.unite_prix)) {
      const q = parseFloat(baseQuantite || 0);
      if (Number.isNaN(q) || q <= 0) {
        setError('Veuillez fournir une quantité de base valide (heures / m² / unités).');
        return false;
      }
    }

    // Validate selected options quantities to avoid backend rejections
    const pricing = service?.parametres_specifiques?.options_pricing;
    if (pricing && typeof pricing === 'object') {
      for (const opt of Object.values(selectedOptions)) {
        const rows = pricing[opt.group];
        if (!Array.isArray(rows)) continue;
        const row = rows.find(r => r?.nom === opt.nom && r?.enabled);
        if (!row) continue;

        const unit = String(row.unite || '').toLowerCase();
        if (unit.includes('/service')) continue; // quantity forced to 1 on backend

        const oq = parseFloat(opt.quantite || 0);
        if (Number.isNaN(oq) || oq <= 0) {
          setError(`Quantité invalide pour l'option "${opt.nom}".`);
          return false;
        }
      }
    }

    if (dateSouhaitee) {
      const selectedDate = fromYmdLocal(dateSouhaitee);
      if (!selectedDate) {
        setError('Date souhaitée invalide.');
        return false;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate.getTime() <= today.getTime()) {
        setError('La date souhaitée doit être postérieure à aujourd\'hui');
        return false;
      }
      // If intervenant has availability days, ensure chosen date matches them (frontend guard)
      if (availableDays.length > 0) {
        const jsDay = selectedDate.getDay(); // 0=Sun..6=Sat
        const iso = jsDay === 0 ? 7 : jsDay;
        if (!availableDays.includes(iso)) {
          setError('Veuillez choisir une date qui correspond aux jours de disponibilité de l’intervenant.');
          return false;
        }
      }
    }
    return true;
  };

  const getBaseUnitLabel = (unitePrix) => {
    switch (unitePrix) {
      case 'par_heure': return 'heures';
      case 'par_m2': return 'm²';
      case 'par_unite': return 'unités';
      case 'par_service': return 'service';
      case 'forfait': return 'forfait';
      default: return 'unité';
    }
  };

  const computeEstimate = () => {
    if (!service) return 0;
    const basePrice = parseFloat(service.prix || 0);
    const unit = service.unite_prix;
    let qty = 1;
    if (['par_heure', 'par_m2', 'par_unite'].includes(unit)) {
      qty = parseFloat(baseQuantite || 0);
      if (Number.isNaN(qty) || qty <= 0) qty = 0;
    }
    let total = basePrice * qty;

    const pricing = service?.parametres_specifiques?.options_pricing;
    if (pricing && typeof pricing === 'object') {
      Object.values(selectedOptions).forEach((opt) => {
        const rows = pricing[opt.group];
        if (!Array.isArray(rows)) return;
        const row = rows.find(r => r?.nom === opt.nom && r?.enabled);
        if (!row) return;
        const p = parseFloat(row.prix || 0);
        if (!p) return;
        const u = row.unite || '';
        const q = (typeof u === 'string' && u.toLowerCase().includes('/service')) ? 1 : parseFloat(opt.quantite || 0);
        if (Number.isNaN(q) || q <= 0) return;
        total += p * q;
      });
    }

    return Math.round(total * 100) / 100;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const computed = computeEstimate();
      const needsBaseQty = ['par_heure', 'par_m2', 'par_unite'].includes(service?.unite_prix);
      const baseQtyValue = needsBaseQty ? parseFloat(baseQuantite || 0) : 1;

      const parametresDemande = {
        base_quantite: baseQtyValue,
        adresse_profil: { adresse: profileAdresse || null, ville: profileVille || null },
        utilise_adresse_profil: useProfileAddress,
        options: Object.values(selectedOptions).map(o => ({
          group: o.group,
          nom: o.nom,
          quantite: parseFloat(o.quantite || 0),
        })),
      };

      const demandeData = {
        service_id: parseInt(serviceId),
        type_demande: 'libre',
        adresse: adresse.trim(),
        ville: ville.trim(),
        description: description.trim(),
        date_souhaitee: dateSouhaitee || null,
        // Backend will recompute from service pricing; we send computed for UX.
        prix_total: computed > 0 ? computed : null,
        parametres_demande: JSON.stringify(parametresDemande),
      };
      
      const res = await API.post('/demandes', demandeData);
      
      alert('Demande créée avec succès !');
      navigate('/mes-demandes');
    } catch (err) {
      console.error('Error submitting demande:', err);
      const errorMsg = err.response?.data?.message || 
                       err.response?.data?.error || 
                       'Erreur lors de la création de la demande';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };
  
  const subServiceName = service?.sub_service?.nom;
  const subServicePrice = service?.prix;
  const subServiceUnit = service?.unite_prix;
  const optionsPricing = service?.parametres_specifiques?.options_pricing || null;
  const isMenuiserie = service?.type_service === 'menuiserie';
  const boisRows = isMenuiserie && optionsPricing?.bois ? optionsPricing.bois.filter(r => r?.enabled) : [];
  const finitionRows = isMenuiserie && optionsPricing?.finitions ? optionsPricing.finitions.filter(r => r?.enabled) : [];
  const estimate = computeEstimate();
  const enabledOptionsCount = useMemo(() => {
    if (!optionsPricing || typeof optionsPricing !== 'object') return 0;
    let count = 0;
    Object.values(optionsPricing).forEach((rows) => {
      if (!Array.isArray(rows)) return;
      count += rows.filter(r => r?.enabled).length;
    });
    return count;
  }, [optionsPricing]);
  const hasAnyEnabledOptions = enabledOptionsCount > 0;

  // Sync specialized UI (bois + finitions) into selectedOptions for backend computation
  useEffect(() => {
    if (!isMenuiserie || !optionsPricing) return;
    setSelectedOptions((prev) => {
      const next = { ...prev };
      // remove previous menuiserie-related options
      Object.keys(next).forEach((k) => {
        if (k.startsWith('bois::') || k.startsWith('finitions::')) delete next[k];
      });
      // add selected bois
      if (preferredBois) {
        next[`bois::${preferredBois}`] = {
          group: 'bois',
          nom: preferredBois,
          // bois priced usually per m² -> use base quantity as default
          quantite: baseQuantite || '1',
        };
      }
      // add selected finitions
      Object.entries(selectedFinitions).forEach(([nom, checked]) => {
        if (!checked) return;
        // finition often MAD/service -> backend will force quantity=1 if unit includes /service
        next[`finitions::${nom}`] = { group: 'finitions', nom, quantite: '1' };
      });
      return next;
    });
  }, [isMenuiserie, optionsPricing, preferredBois, selectedFinitions, baseQuantite]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
          <Loader className="w-8 h-8 text-amber-600 animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }
  
  if (error && !service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Retour
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-green-50">
      <Header />
      <div className="flex-grow pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-amber-900 mb-2">Faire une demande</h1>
            {service && (
              <div className="flex items-center gap-2 text-amber-700">
                <Package className="w-5 h-5" />
                <span className="text-lg">{service.titre}</span>
                {service.intervenant && (
                  <span className="text-sm">- {service.intervenant.prenom} {service.intervenant.nom}</span>
                )}
              </div>
            )}
            {service && subServiceName && (
              <div className="mt-2 text-sm text-amber-700">
                Sous-service: <span className="font-semibold text-amber-900">{subServiceName}</span>
                {subServicePrice ? (
                  <span className="ml-2 text-green-700 font-semibold">
                    ({subServicePrice} / {subServiceUnit || 'unité'})
                  </span>
                ) : null}
              </div>
            )}
          </div>
          
          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-amber-200 p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 resize-none"
                placeholder="Décrivez votre besoin en détail..."
                maxLength={1000}
                required
              />
              <div className="text-right text-xs text-amber-600 mt-1">
                {description.length}/1000 caractères
              </div>
            </div>

            {/* Estimation: base quantity */}
            {service && service.unite_prix && ['par_heure', 'par_m2', 'par_unite'].includes(service.unite_prix) && (
              <div>
                <label className="block text-sm font-semibold text-amber-900 mb-2">
                  Quantité (pour le prix de base) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={baseQuantite}
                    onChange={(e) => setBaseQuantite(e.target.value)}
                    className="w-48 px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                  <span className="text-amber-700">{getBaseUnitLabel(service.unite_prix)}</span>
                </div>
              </div>
            )}

            {/* Options selection */}
            {hasAnyEnabledOptions && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="font-semibold text-amber-900">Options (prix calculé)</div>
                  <div className="text-xs text-amber-700">{enabledOptionsCount} option(s) tarifée(s)</div>
                </div>
                <div className="space-y-4">
                  {/* Menuiserie UX: choose wood + finitions */}
                  {isMenuiserie && (
                    <div className="space-y-4">
                      <div className="p-3 bg-white rounded-lg border border-amber-200">
                        <div className="text-sm font-semibold text-amber-900 mb-2">Type de bois préféré</div>
                        <select
                          value={preferredBois}
                          onChange={(e) => setPreferredBois(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                        >
                          <option value="">Sélectionnez un bois</option>
                          {boisRows.map((r) => (
                            <option key={r.nom} value={r.nom}>{r.nom} — {r.prix} ({r.unite})</option>
                          ))}
                        </select>
                      </div>

                      <div className="p-3 bg-white rounded-lg border border-amber-200">
                        <div className="text-sm font-semibold text-amber-900 mb-2">Finitions</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {finitionRows.map((r) => (
                            <label key={r.nom} className="flex items-center justify-between gap-3 p-2 rounded-lg border border-amber-100 bg-amber-50">
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={!!selectedFinitions[r.nom]}
                                  onChange={(e) => setSelectedFinitions(prev => ({ ...prev, [r.nom]: e.target.checked }))}
                                />
                                <span className="font-semibold text-amber-900">{r.nom}</span>
                              </span>
                              <span className="text-green-700 font-semibold">{r.prix} ({r.unite})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {Object.entries(optionsPricing).map(([groupKey, rows]) => {
                    if (!Array.isArray(rows)) return null;
                    const enabledRows = rows.filter(r => r?.enabled);
                    if (enabledRows.length === 0) return null;
                    // Skip menu-specific groups because we have a dedicated UX above
                    if (isMenuiserie && (groupKey === 'bois' || groupKey === 'finitions')) return null;
                    return (
                      <div key={groupKey} className="p-3 bg-white rounded-lg border border-amber-200">
                        <div className="text-sm font-semibold text-amber-900 mb-2">{groupKey}</div>
                        <div className="space-y-2">
                          {enabledRows.map((r) => {
                            const key = `${groupKey}::${r.nom}`;
                            const selected = !!selectedOptions[key];
                            const isPerService = (r.unite || '').toLowerCase().includes('/service');
                            return (
                              <div key={key} className="flex flex-col md:flex-row md:items-center gap-3 p-2 rounded-lg border border-amber-100">
                                <label className="flex items-center gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedOptions(prev => ({
                                          ...prev,
                                          [key]: { group: groupKey, nom: r.nom, quantite: isPerService ? '1' : '1' }
                                        }));
                                      } else {
                                        setSelectedOptions(prev => {
                                          const copy = { ...prev };
                                          delete copy[key];
                                          return copy;
                                        });
                                      }
                                    }}
                                  />
                                  <span className="font-semibold text-amber-900">{r.nom}</span>
                                  <span className="text-sm text-green-700 font-semibold ml-2">{r.prix} ({r.unite})</span>
                                </label>
                                {!isPerService && selected && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-amber-700">Qté</span>
                                    <input
                                      type="number"
                                      min="0.01"
                                      step="0.01"
                                      value={selectedOptions[key]?.quantite || '1'}
                                      onChange={(e) => setSelectedOptions(prev => ({
                                        ...prev,
                                        [key]: { ...prev[key], quantite: e.target.value }
                                      }))}
                                      className="w-28 px-3 py-2 border border-amber-200 rounded-lg"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!hasAnyEnabledOptions && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
                Aucune option tarifée n’est définie pour ce service (l’estimation utilise uniquement le prix de base).
              </div>
            )}

            {/* Estimated total */}
            {service && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center justify-between">
                <span className="font-semibold text-green-900">Prix estimé</span>
                <span className="text-2xl font-bold text-green-900">{estimate.toFixed(2)} DH</span>
              </div>
            )}
            
            {/* Prix estimé manuel supprimé: calcul automatique via options + quantité */}
            
            {/* Adresse */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Adresse <span className="text-red-500">*</span>
              </label>
              {(profileAdresse || profileVille) && (
                <div className="mb-3 space-y-2">
                  <div className="text-sm text-amber-800 font-semibold">Quelle adresse utiliser ?</div>
                  <label className="flex items-center gap-2 text-sm text-amber-800">
                    <input
                      type="radio"
                      name="addressSource"
                      checked={useProfileAddress}
                      onChange={() => setUseProfileAddress(true)}
                    />
                    <span>
                      Adresse du profil
                      {profileAdresse ? ` (${profileAdresse}${profileVille ? `, ${profileVille}` : ''})` : ''}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-amber-800">
                    <input
                      type="radio"
                      name="addressSource"
                      checked={!useProfileAddress}
                      onChange={() => setUseProfileAddress(false)}
                    />
                    <span>Saisir une autre adresse</span>
                  </label>
                </div>
              )}
              <input
                type="text"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                placeholder="Ex: 123 Rue Mohammed V"
                required
                disabled={useProfileAddress && !!profileAdresse}
              />
            </div>
            
            {/* Ville */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Ville <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                placeholder="Ex: Casablanca"
                required
                disabled={useProfileAddress && !!profileVille}
              />
            </div>
            
            {/* Date souhaitée */}
            <div>
              <label className="block text-sm font-semibold text-amber-900 mb-2">
                Date souhaitée (optionnel)
              </label>
              {availableDates.length > 0 ? (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <select
                    value={dateSouhaitee}
                    onChange={(e) => setDateSouhaitee(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600 bg-white"
                  >
                    <option value="">Choisir une date</option>
                    {availableDates.map((d) => {
                      const iso = toYmdLocal(d);
                      const label = d.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                      return <option key={iso} value={iso}>{label}</option>;
                    })}
                  </select>
                </div>
              ) : (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                  <input
                    type="date"
                    value={dateSouhaitee}
                    onChange={(e) => setDateSouhaitee(e.target.value)}
                    min={toYmdLocal(new Date(Date.now() + 86400000))} // Demain (local)
                    className="w-full pl-10 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-600"
                  />
                  <p className="text-xs text-amber-700 mt-2">
                    Aucune disponibilité définie par l'intervenant : vous pouvez choisir n'importe quelle date.
                  </p>
                </div>
              )}
            </div>
            
            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 border-2 border-amber-300 text-amber-900 rounded-lg hover:bg-amber-50 transition-colors font-semibold"
                disabled={submitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

