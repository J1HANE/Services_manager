// src/components/LeafletWrapper.jsx
import React, { useEffect, useState } from 'react';

export function LeafletWrapper({ children, style = {}, className = '' }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Corriger les icônes Leaflet une fois chargé
    const fixLeafletIcons = () => {
      if (typeof window === 'undefined' || !window.L) return;
      
      try {
        const L = window.L;
        if (L.Icon && L.Icon.Default && L.Icon.Default.prototype._getIconUrl) {
          delete L.Icon.Default.prototype._getIconUrl;
        }
        
        if (L.Icon && L.Icon.Default && L.Icon.Default.mergeOptions) {
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        }
      } catch (error) {
        console.warn('Could not fix Leaflet icons:', error);
      }
    };

    // Essayer de corriger les icônes immédiatement et après un délai
    fixLeafletIcons();
    const timer = setTimeout(fixLeafletIcons, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isClient) {
    return (
      <div 
        className={`flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 ${className}`} 
        style={style}
      >
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-amber-700 font-serif">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={style} 
      className={`relative ${className}`}
    >
      {children}
    </div>
  );
}