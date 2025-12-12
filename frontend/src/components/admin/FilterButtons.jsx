import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Search } from 'lucide-react';

const FilterButton = ({ label, value, onClear, onClick, hasDropdown = false, options = [], onSelect, active = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (value && !hasDropdown) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.02 }}
        className="px-6 py-3.5 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900 font-semibold flex items-center gap-3 shadow-md min-w-[160px]"
      >
        <span className="flex-1">{value}</span>
        {onClear && (
          <button
            onClick={onClear}
            className="ml-2 p-1.5 rounded-full hover:bg-amber-200 transition-colors"
          >
            <X className="w-4 h-4 text-amber-700" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => hasDropdown && setIsOpen(!isOpen)}
        className={`px-6 py-3.5 rounded-xl border-2 font-semibold flex items-center gap-3 transition-all shadow-md min-w-[160px] ${
          active
            ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-900'
            : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-50 hover:border-amber-300'
        }`}
      >
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className={`w-5 h-5 text-amber-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && hasDropdown && options.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border-2 border-amber-200 shadow-xl z-50 overflow-hidden"
          >
            {options.map((option, index) => (
              <motion.button
                key={option.value || option}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  onSelect(option.value || option);
                  setIsOpen(false);
                }}
                className="w-full px-6 py-3 text-left hover:bg-amber-50 transition-colors font-medium text-slate-700 border-b border-slate-100 last:border-b-0"
              >
                {option.label || option}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FilterButtons({ filters, onFilterChange, onReset, filterOptions = {}, searchValue = '', onSearchChange, searchPlaceholder = 'Rechercher...' }) {
  const { roles = [], statuts = [], types = [], createurTypes = [], verifiedOptions = [], bannedOptions = [], typeServices = [] } = filterOptions;

  const roleOptions = roles.map(r => ({ value: r, label: r === 'client' ? 'Client' : r === 'intervenant' ? 'Intervenant' : r === 'admin' ? 'Admin' : r }));
  const statutOptions = Array.isArray(statuts) && statuts.length > 0 && typeof statuts[0] === 'object' 
    ? statuts 
    : statuts.map(s => ({ value: s, label: s }));
  const typeOptions = Array.isArray(types) && types.length > 0 && typeof types[0] === 'object'
    ? types
    : types.map(t => ({ value: t, label: t }));
  const typeServiceOptions = Array.isArray(typeServices) && typeServices.length > 0 && typeof typeServices[0] === 'object'
    ? typeServices
    : typeServices.map(ts => ({ value: ts, label: ts }));
  const createurTypeOptions = createurTypes.map(ct => ({ value: ct, label: ct === 'client' ? 'Client' : 'Intervenant' }));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Barre de recherche */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[250px]">
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-6 py-3.5 pl-12 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 font-medium text-slate-700"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        )}

        {/* Filtre Rôles */}
        {roles.length > 0 && (
          <FilterButton
            label="Tous les rôles"
            value={filters.role ? (filters.role === 'client' ? 'Client' : filters.role === 'intervenant' ? 'Intervenant' : 'Admin') : null}
            onClear={() => onFilterChange({ ...filters, role: '' })}
            hasDropdown={!filters.role}
            options={roleOptions}
            onSelect={(value) => onFilterChange({ ...filters, role: value })}
            active={!!filters.role}
          />
        )}

        {/* Filtre Statuts */}
        {statuts.length > 0 && (
          <FilterButton
            label="Tous les statuts"
            value={filters.statut || null}
            onClear={() => onFilterChange({ ...filters, statut: '' })}
            hasDropdown={!filters.statut}
            options={statutOptions}
            onSelect={(value) => onFilterChange({ ...filters, statut: value })}
            active={!!filters.statut}
          />
        )}

        {/* Filtre Verified */}
        {verifiedOptions.length > 0 && (
          <FilterButton
            label="Tous les statuts"
            value={filters.est_verifie ? (filters.est_verifie === 'true' ? 'Vérifiés' : 'Non vérifiés') : null}
            onClear={() => onFilterChange({ ...filters, est_verifie: '' })}
            hasDropdown={!filters.est_verifie}
            options={verifiedOptions}
            onSelect={(value) => onFilterChange({ ...filters, est_verifie: value })}
            active={!!filters.est_verifie}
          />
        )}

        {/* Filtre Banned */}
        {bannedOptions.length > 0 && (
          <FilterButton
            label="Tous"
            value={filters.is_banned ? (filters.is_banned === 'true' ? 'Bannis' : 'Actifs') : null}
            onClear={() => onFilterChange({ ...filters, is_banned: '' })}
            hasDropdown={!filters.is_banned}
            options={bannedOptions}
            onSelect={(value) => onFilterChange({ ...filters, is_banned: value })}
            active={!!filters.is_banned}
          />
        )}

        {/* Filtre Types */}
        {types.length > 0 && (
          <FilterButton
            label="Tous"
            value={filters.type || filters.type_demande || filters.cible || null}
            onClear={() => onFilterChange({ ...filters, type: '', type_demande: '', cible: '' })}
            hasDropdown={!filters.type && !filters.type_demande && !filters.cible}
            options={typeOptions}
            onSelect={(value) => {
              const updates = { ...filters };
              if (filters.hasOwnProperty('cible')) {
                updates.cible = value;
              } else if (filters.hasOwnProperty('type_demande')) {
                updates.type_demande = value;
                updates.type = value;
              } else {
                updates.type = value;
              }
              onFilterChange(updates);
            }}
            active={!!(filters.type || filters.type_demande || filters.cible)}
          />
        )}

        {/* Filtre Type Services */}
        {typeServices.length > 0 && (
          <FilterButton
            label="Tous les services"
            value={filters.type_service || null}
            onClear={() => onFilterChange({ ...filters, type_service: '' })}
            hasDropdown={!filters.type_service}
            options={typeServiceOptions}
            onSelect={(value) => onFilterChange({ ...filters, type_service: value })}
            active={!!filters.type_service}
          />
        )}

        {/* Filtre Createur Type */}
        {createurTypes.length > 0 && (
          <FilterButton
            label="Tous"
            value={filters.createur_type ? (filters.createur_type === 'client' ? 'Client' : 'Intervenant') : null}
            onClear={() => onFilterChange({ ...filters, createur_type: '' })}
            hasDropdown={!filters.createur_type}
            options={createurTypeOptions}
            onSelect={(value) => onFilterChange({ ...filters, createur_type: value })}
            active={!!filters.createur_type}
          />
        )}

        {/* Bouton Reset */}
        {(filters.role || filters.statut || filters.type || filters.type_service || filters.type_demande || filters.createur_type || filters.est_verifie || filters.is_banned || filters.ville || filters.cible) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="px-6 py-3.5 rounded-xl border-2 border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all shadow-md"
          >
            Réinitialiser
          </motion.button>
        )}
      </div>
    </div>
  );
}
