
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/Header';
import Footer from '../components/Footer';

import { LeafletWrapper } from '../components/LeafletWrapper';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import { 
  Search, MapPin, Star, Hammer, Paintbrush, Zap, 
  ChevronDown, ChevronUp, Navigation 
} from 'lucide-react';
import { intervenants } from '../lib/intervenants-data';

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
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [mapReady, setMapReady] = useState(false);

  // Obtenir toutes les villes uniques
  const villes = useMemo(() => {
    const allVilles = intervenants
      .filter(i => !serviceType || i.service === serviceType)
      .map(i => i.ville);
    return Array.from(new Set(allVilles)).sort();
  }, [serviceType]);

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
  }, [serviceType, searchTerm, selectedVille]);

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
        <div className="flex flex-col lg:flex-row h-[calc(100vh-280px)]">
          {/* Liste des intervenants (50%) */}
          <div className="w-full lg:w-1/2 overflow-y-auto p-6 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
            <div className="max-w-2xl mx-auto space-y-4">
              {filteredIntervenants.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-amber-600 mb-4">
                    <Search className="w-16 h-16 mx-auto opacity-50" />
                  </div>
                  <p className="text-xl text-amber-900">Aucun intervenant trouvé</p>
                  <p className="text-amber-700 mt-2">Essayez de modifier vos critères de recherche</p>
                </div>
              ) : (
                filteredIntervenants.map((intervenant) => {
                  const isExpanded = expandedCards.has(intervenant.id);
                  const isSelected = selectedIntervenant?.id === intervenant.id;
                  const shortDescription = intervenant.description.length > 150 
                    ? intervenant.description.substring(0, 150) + '...'
                    : intervenant.description;

                  return (
                    <div
                      key={intervenant.id}
                      onClick={() => setSelectedIntervenant(intervenant)}
                      className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer border-2 ${
                        isSelected ? 'border-orange-500 ring-4 ring-orange-200' : 'border-transparent'
                      }`}
                    >
                      <div className="p-5">
                        {/* En-tête avec image et infos principales */}
                        <div className="flex gap-4">
                          <img
                            src={intervenant.image}
                            alt={intervenant.surnom}
                            className="w-24 h-24 rounded-lg object-cover border-2 border-orange-200"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-xl text-amber-900 mb-1">{intervenant.surnom}</h3>
                                <div 
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm"
                                  style={{ backgroundColor: getServiceColor(intervenant.service) }}
                                >
                                  {getServiceIcon(intervenant.service)}
                                  <span>{getServiceLabel(intervenant.service)}</span>
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedIntervenant(intervenant);
                                }}
                                className="p-2 text-orange-600 hover:text-orange-700"
                                title="Voir sur la carte"
                              >
                                <Navigation className="w-5 h-5" />
                              </button>
                            </div>
                            
                            <div className="flex items-center gap-1 mb-2">
                              <MapPin className="w-4 h-4 text-orange-600" />
                              <span className="text-amber-800">{intervenant.ville}</span>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-amber-700">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                <span className="font-semibold text-amber-900">{intervenant.rating}</span>
                                <span>({intervenant.nbAvis} avis)</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="mt-4">
                          <p className="text-amber-800 leading-relaxed">
                            {isExpanded ? intervenant.description : shortDescription}
                          </p>
                          {intervenant.description.length > 150 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCardExpansion(intervenant.id);
                              }}
                              className="mt-2 text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
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
                        </div>

                        {/* Infos supplémentaires */}
                        <div className="mt-4 pt-4 border-t border-orange-100 flex items-center justify-between">
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-amber-700">Tarif: </span>
                              <span className="font-semibold text-amber-900">{intervenant.tarif}</span>
                            </div>
                            <div>
                              <span className="text-amber-700">Expérience: </span>
                              <span className="font-semibold text-amber-900">{intervenant.experience}</span>
                            </div>
                          </div>
                          <button
                            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Contacter ${intervenant.surnom}`);
                            }}
                          >
                            Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Carte géographique (50%) */}
          <div className="w-full lg:w-1/2 h-full">
            <LeafletWrapper 
              className="h-full w-full relative"
              style={{ minHeight: '500px' }}
            >
              <MapContainer
                center={mapCenter}
                zoom={6}
                className="h-full w-full rounded-lg"
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
                      <div className="p-2" style={{ fontFamily: 'Times New Roman, serif', minWidth: '200px' }}>
                        <img
                          src={intervenant.image}
                          alt={intervenant.surnom}
                          className="w-16 h-16 rounded-lg object-cover mb-2 mx-auto"
                        />
                        <h3 className="font-semibold text-amber-900 mb-1 text-center">{intervenant.surnom}</h3>
                        <div className="flex items-center gap-1 text-sm text-amber-700 mb-2 justify-center">
                          <MapPin className="w-3 h-3" />
                          <span>{intervenant.ville}</span>
                        </div>
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs mb-2 mx-auto"
                          style={{ backgroundColor: getServiceColor(intervenant.service) }}
                        >
                          {getServiceIcon(intervenant.service)}
                          <span>{getServiceLabel(intervenant.service)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm justify-center">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="font-semibold">{intervenant.rating}</span>
                          <span className="text-amber-600">({intervenant.nbAvis} avis)</span>
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-sm font-semibold text-amber-900">{intervenant.tarif}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Légende de la carte */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000]">
                <div className="text-sm text-amber-900 font-semibold mb-2">Légende</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-600"></div>
                    <span className="text-xs text-amber-700">Menuiserie</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-orange-600"></div>
                    <span className="text-xs text-amber-700">Peinture</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-700"></div>
                    <span className="text-xs text-amber-700">Électricité</span>
                  </div>
                </div>
              </div>

              {/* Bouton de réinitialisation */}
              {selectedIntervenant && (
                <button
                  onClick={() => setSelectedIntervenant(null)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-4 py-2 z-[1000] text-amber-900 hover:bg-white transition-colors"
                >
                  <span className="text-sm font-semibold">Voir tous</span>
                </button>
              )}
            </LeafletWrapper>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RechercheIntervenantsPage;