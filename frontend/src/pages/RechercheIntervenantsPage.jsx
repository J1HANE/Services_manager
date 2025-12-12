

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';

import { LeafletWrapper } from '../components/LeafletWrapper';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import {
  Search, MapPin, Star, Hammer, Paintbrush, Zap,
  ChevronDown, ChevronUp, Navigation, AlertCircle
} from 'lucide-react';
import { fetchServices } from '../lib/api/services';
import { ServiceDetailsModal } from '../components/ServiceDetailsModal';

// Composant pour centrer la carte
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

function RechercheIntervenantsPage({ serviceType = null }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVille, setSelectedVille] = useState('');
  const [selectedIntervenant, setSelectedIntervenant] = useState(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [mapReady, setMapReady] = useState(false);

  // New state for API data
  const [intervenants, setIntervenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Otherwise, prefix with backend URL
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const backendUrl = API_BASE_URL.replace('/api', '');

    // Remove leading slash if present to avoid double slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;

    return `${backendUrl}/${cleanPath}`;
  };

  // Fetch services from API on component mount or when serviceType changes
  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {};
        if (serviceType) {
          params.type_service = serviceType;
        }

        const data = await fetchServices(params);
        setIntervenants(data);
      } catch (err) {
        console.error('Failed to load services:', err);
        setError('Impossible de charger les services. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [serviceType]);

  // Obtenir toutes les villes uniques
  const villes = useMemo(() => {
    const allVilles = intervenants
      .filter(i => !serviceType || i.service === serviceType)
      .map(i => i.ville);
    return Array.from(new Set(allVilles)).sort();
  }, [intervenants, serviceType]);

  // Filtrer les intervenants
  const filteredIntervenants = useMemo(() => {
    return intervenants.filter(intervenant => {
      const matchService = !serviceType || intervenant.service === serviceType;
      const matchSearch = !searchTerm ||
        intervenant.surnom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervenant.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchVille = !selectedVille || intervenant.ville === selectedVille;

      return matchService && matchSearch && matchVille;
    });
  }, [intervenants, serviceType, searchTerm, selectedVille]);

  // Centre de la carte
  const mapCenter = selectedIntervenant
    ? [selectedIntervenant.lat, selectedIntervenant.lng]
    : [46.603354, 1.888334]; // Centre de la France

  const toggleCardExpansion = (id) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const getServiceIcon = (service) => {
    switch (service) {
      case 'menuiserie':
        return <Hammer className="w-5 h-5" />;
      case 'peinture':
        return <Paintbrush className="w-5 h-5" />;
      case 'electricite':
        return <Zap className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getServiceColor = (service) => {
    switch (service) {
      case 'menuiserie':
        return '#D97706';
      case 'peinture':
        return '#B45309';
      case 'electricite':
        return '#15803d';
      default:
        return '#666666';
    }
  };

  const getServiceLabel = (service) => {
    switch (service) {
      case 'menuiserie':
        return 'Menuiserie';
      case 'peinture':
        return 'Peinture';
      case 'electricite':
        return 'Électricité';
      default:
        return 'Service';
    }
  };

  // Créer des icônes personnalisées
  const createCustomIcon = (service, isSelected = false) => {
    if (typeof window === 'undefined') return null;

    return import('leaflet').then((L) => {
      const colors = {
        menuiserie: '#D97706',
        peinture: '#B45309',
        electricite: '#15803d',
      };

      const icons = {
        menuiserie: '🔨',
        peinture: '🎨',
        electricite: '⚡',
      };

      const size = isSelected ? 45 : 35;
      const color = colors[service] || '#666666';
      const icon = icons[service] || '👤';

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            font-size: ${size * 0.5}px;
            transition: all 0.3s ease;
            ${isSelected ? 'transform: scale(1.2);' : ''}
          ">
            ${icon}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    });
  };

  const getTitle = () => {
    if (serviceType === 'menuiserie') return "Menuiserie - Nos Artisans Qualifiés";
    if (serviceType === 'peinture') return "Peinture - Nos Professionnels de la Peinture";
    if (serviceType === 'electricite') return "Électricité - Nos Électriciens Certifiés";
    return "Tous nos Services - Recherche d'Intervenants";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow bg-gradient-to-br from-amber-50 via-orange-50 to-green-50" style={{ fontFamily: 'Times New Roman, serif' }}>

        {/* Page Title */}
        <div className="bg-gradient-to-r from-amber-900 via-orange-800 to-green-900 text-white py-12 px-4 pt-32">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl mb-2">{getTitle()}</h1>
            <p className="text-amber-100">
              {serviceType
                ? `Découvrez nos professionnels en ${getServiceLabel(serviceType)}`
                : 'Découvrez tous nos professionnels qualifiés'
              }
            </p>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white border-b border-orange-200 py-6 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un intervenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Filtre par ville */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5 pointer-events-none" />
                <select
                  value={selectedVille}
                  onChange={(e) => setSelectedVille(e.target.value)}
                  className="pl-12 pr-10 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors appearance-none bg-white min-w-[200px] cursor-pointer"
                >
                  <option value="">Toutes les villes</option>
                  {villes.map(ville => (
                    <option key={ville} value={ville}>{ville}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5 pointer-events-none" />
              </div>
            </div>

            {/* Résultats */}
            <div className="mt-4 text-amber-900">
              <span className="font-semibold">{filteredIntervenants.length}</span> intervenant{filteredIntervenants.length > 1 ? 's' : ''} trouvé{filteredIntervenants.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Contenu principal : Liste + Carte */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liste des intervenants (Left Side) */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-md p-4 sticky top-4">
                <h2 className="text-2xl font-bold text-amber-900 mb-2">
                  Services Disponibles
                </h2>
                <p className="text-amber-700 text-sm">
                  Cliquez sur un service pour voir sa localisation sur la carte
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mb-4"></div>
                  <p className="text-xl text-amber-900">Chargement des services...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <div className="text-red-600 mb-4">
                    <AlertCircle className="w-16 h-16 mx-auto" />
                  </div>
                  <p className="text-xl text-red-900 mb-2">Erreur</p>
                  <p className="text-red-700">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              )}

              {/* No Results */}
              {!loading && !error && filteredIntervenants.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <div className="text-amber-600 mb-4">
                    <Search className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <p className="text-xl text-amber-900">Aucun intervenant trouvé</p>
                  <p className="text-amber-700 mt-2">Essayez de modifier vos critères de recherche</p>
                </div>
              )}

              {/* Intervenants List */}
              {!loading && !error && filteredIntervenants.length > 0 && (
                filteredIntervenants.map((intervenant) => {
                  const isExpanded = expandedCards.has(intervenant.id);
                  const isSelected = selectedIntervenant?.id === intervenant.id;
                  const shortDescription = intervenant.description.length > 120
                    ? intervenant.description.substring(0, 120) + '...'
                    : intervenant.description;

                  return (
                    <div
                      key={intervenant.id}
                      onClick={() => setSelectedIntervenant(intervenant)}
                      className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 transform hover:-translate-y-1 ${isSelected
                        ? 'border-orange-500 ring-4 ring-orange-200 scale-[1.02]'
                        : 'border-transparent hover:border-orange-300'
                        }`}
                    >
                      <div className="p-6 flex gap-4">
                        {/* Image Section */}
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(intervenant.image)}
                            alt={intervenant.surnom}
                            className="w-24 h-24 rounded-lg object-cover shadow-md"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-bold text-amber-900 mb-1">{intervenant.titre || 'Service sans titre'}</h3>
                              <p className="text-sm text-amber-700 mb-2">
                                Par: <span className="font-semibold">{intervenant.intervenant?.surnom || intervenant.surnom}</span>
                              </p>
                              <div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold shadow-md"
                                style={{ backgroundColor: getServiceColor(intervenant.service) }}
                              >
                                {getServiceIcon(intervenant.service)}
                                <span>{getServiceLabel(intervenant.service)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mb-2 text-amber-800">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            <span className="font-medium">{intervenant.ville}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                            <span className="font-bold text-amber-900 text-lg">{intervenant.rating}</span>
                            <span className="text-amber-700 text-sm">({intervenant.nbAvis} avis)</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="p-6 pt-0">
                        <p className="text-amber-800 leading-relaxed mb-4">
                          {isExpanded ? intervenant.description : shortDescription}
                        </p>
                        {intervenant.description.length > 120 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardExpansion(intervenant.id);
                            }}
                            className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <span>Voir moins</span>
                                <ChevronUp className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <span>Lire la suite</span>
                                <ChevronDown className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 my-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-orange-100">
                          <div>
                            <span className="text-amber-700 text-sm block mb-1">Missions</span>
                            <span className="font-bold text-amber-900 text-lg">{intervenant.missions_completees || 0}</span>
                          </div>
                          <div>
                            <span className="text-amber-700 text-sm block mb-1">Catégories</span>
                            <span className="font-bold text-amber-900 text-lg">{intervenant.total_categories || 0}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                          <button
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md hover:shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServiceDetails(intervenant);
                            }}
                          >
                            Détails
                          </button>
                          <button
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all font-semibold shadow-md hover:shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Contacter ${intervenant.intervenant?.surnom || intervenant.surnom}`);
                            }}
                          >
                            Contacter
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIntervenant(intervenant);
                            }}
                            className="px-4 py-3 bg-white border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-all font-semibold shadow-md"
                            title="Voir sur la carte"
                          >
                            <Navigation className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Carte géographique (Right Side) */}
            <div className="lg:sticky lg:top-4 h-[600px] lg:h-[calc(100vh-120px)]">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                <div className="bg-gradient-to-r from-amber-900 to-orange-800 text-white p-4">
                  <h2 className="text-xl font-bold">Localisation des Services</h2>
                  <p className="text-amber-100 text-sm mt-1">
                    {filteredIntervenants.length} service{filteredIntervenants.length > 1 ? 's' : ''} disponible{filteredIntervenants.length > 1 ? 's' : ''}
                  </p>
                </div>

                <LeafletWrapper
                  className="h-[calc(100%-80px)] w-full relative"
                >
                  <MapContainer
                    center={mapCenter}
                    zoom={6}
                    className="h-full w-full"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <MapController center={mapCenter} />

                    {filteredIntervenants.map((intervenant) => (
                      <Marker
                        key={intervenant.id}
                        position={[intervenant.lat, intervenant.lng]}
                        eventHandlers={{
                          click: () => {
                            setSelectedIntervenant(intervenant);
                          },
                        }}
                      >
                        <Popup>
                          <div className="p-3" style={{ fontFamily: 'Times New Roman, serif', minWidth: '220px' }}>
                            <img
                              src={getImageUrl(intervenant.image)}
                              alt={intervenant.surnom}
                              className="w-20 h-20 rounded-lg object-cover mb-3 mx-auto shadow-md"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400';
                              }}
                            />
                            <h3 className="font-bold text-amber-900 mb-1 text-center text-lg">{intervenant.titre || 'Service'}</h3>
                            <p className="text-xs text-amber-700 mb-2 text-center">
                              Par: {intervenant.intervenant?.surnom || intervenant.surnom}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-amber-700 mb-2 justify-center">
                              <MapPin className="w-4 h-4" />
                              <span>{intervenant.ville}</span>
                            </div>
                            <div
                              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm mb-3 w-full justify-center"
                              style={{ backgroundColor: getServiceColor(intervenant.service) }}
                            >
                              {getServiceIcon(intervenant.service)}
                              <span>{getServiceLabel(intervenant.service)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm justify-center mb-2">
                              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                              <span className="font-bold text-amber-900">{intervenant.rating}</span>
                              <span className="text-amber-600">({intervenant.nbAvis} avis)</span>
                            </div>
                            <div className="text-center">
                              <span className="text-sm font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-full">{intervenant.tarif}</span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>

                  {/* Légende de la carte */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 z-[1000] border-2 border-orange-200">
                    <div className="text-sm text-amber-900 font-bold mb-3">Légende</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-amber-600 shadow-md"></div>
                        <span className="text-sm text-amber-800 font-medium">Menuiserie</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-orange-600 shadow-md"></div>
                        <span className="text-sm text-amber-800 font-medium">Peinture</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-700 shadow-md"></div>
                        <span className="text-sm text-amber-800 font-medium">Électricité</span>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de réinitialisation */}
                  {selectedIntervenant && (
                    <button
                      onClick={() => setSelectedIntervenant(null)}
                      className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl px-4 py-2 z-[1000] text-amber-900 hover:bg-white transition-all border-2 border-orange-200 font-semibold"
                    >
                      <span className="text-sm">Voir tous</span>
                    </button>
                  )}
                </LeafletWrapper>
              </div>
            </div>
          </div>
        </div >
      </div >
      <Footer />

      {/* Service Details Modal */}
      {selectedServiceDetails && (
        <ServiceDetailsModal
          service={selectedServiceDetails}
          onClose={() => setSelectedServiceDetails(null)}
        />
      )}
    </div >
  );
}

export default RechercheIntervenantsPage;