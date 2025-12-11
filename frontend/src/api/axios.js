import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Laravel backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // if you use cookies or Laravel Sanctum
});

export default API;
