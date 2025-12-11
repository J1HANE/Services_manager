// src/lib/api/services.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Fetch services from the backend API
 * @param {Object} params - Query parameters for filtering
 * @param {string} params.ville - Filter by city
 * @param {string} params.type_service - Filter by service type (menuiserie, peinture, electricite)
 * @param {string} params.search - Search term for title or description
 * @returns {Promise<Array>} Array of services with intervenant data
 */
export async function fetchServices(params = {}) {
    try {
        // Build query string from params
        const queryParams = new URLSearchParams();

        if (params.ville) {
            queryParams.append('ville', params.ville);
        }

        if (params.type_service) {
            queryParams.append('type_service', params.type_service);
        }

        if (params.search) {
            queryParams.append('search', params.search);
        }

        const url = `${API_BASE_URL}/search${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        console.log('Fetching services from:', url);
        console.log('API_BASE_URL:', API_BASE_URL);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log('API Response:', result);
        console.log('Data count:', result.data?.length);

        if (result.success) {
            return result.data;
        } else {
            throw new Error('Failed to fetch services');
        }
    } catch (error) {
        console.error('Error fetching services:', error);
        throw error;
    }
}

/**
 * Fetch a single artisan profile by ID
 * @param {number|string} id - Artisan ID
 * @returns {Promise<Object>} Artisan profile data
 */
export async function fetchArtisanProfile(id) {
    try {
        const url = `${API_BASE_URL}/artisan/${id}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error('Failed to fetch artisan profile');
        }
    } catch (error) {
        console.error('Error fetching artisan profile:', error);
        throw error;
    }
}
