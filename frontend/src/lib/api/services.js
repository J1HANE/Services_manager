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

/**
 * Fetch categories from the backend API
 * @param {Object} params - Query parameters for filtering
 * @param {string} params.type_service - Filter by service type (menuiserie, peinture, electricite)
 * @param {string} params.type_categorie - Filter by category type (service, materiel)
 * @returns {Promise<Array>} Array of categories
 */
export async function fetchCategories(params = {}) {
    try {
        const queryParams = new URLSearchParams();

        if (params.type_service) {
            queryParams.append('type_service', params.type_service);
        }

        if (params.type_categorie) {
            queryParams.append('type_categorie', params.type_categorie);
        }

        const url = `${API_BASE_URL}/categories${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

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
            throw new Error('Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
}

/**
 * Create a new service
 * @param {Object} serviceData - Service data to create
 * @returns {Promise<Object>} Created service data
 */
export async function createService(serviceData) {
    try {
        const url = `${API_BASE_URL}/services`;

        console.log('Creating service:', serviceData);

        // Get auth token from localStorage
        const token = localStorage.getItem('auth_token');

        // Check if serviceData is FormData or regular object
        const isFormData = serviceData instanceof FormData;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                // Don't set Content-Type for FormData - browser will set it with boundary
                ...(!isFormData && { 'Content-Type': 'application/json' }),
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: isFormData ? serviceData : JSON.stringify(serviceData),
        });

        const result = await response.json();

        console.log('Create service response:', result);

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to create service');
        }
    } catch (error) {
        console.error('Error creating service:', error);
        throw error;
    }
}

