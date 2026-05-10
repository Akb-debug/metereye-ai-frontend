// Rôle : Ce fichier centralise toutes les URLs du backend MeterEye AI.
// Il permet de modifier facilement l'adresse du serveur sans toucher au reste du code.

export const API_CONFIG = {
  // URL de base du backend Spring Boot
  // En production, remplace par l'URL de ton serveur
  baseUrl: 'http://localhost:8080/api',

  endpoints: {
    login:    '/auth/login',
    register: '/auth/register',
    me:       '/auth/me',
  }
};

// URLs complètes prêtes à utiliser dans les services
export const API_URLS = {
  login:    API_CONFIG.baseUrl + API_CONFIG.endpoints.login,
  register: API_CONFIG.baseUrl + API_CONFIG.endpoints.register,
  me:       API_CONFIG.baseUrl + API_CONFIG.endpoints.me,
};

// Clés utilisées pour sauvegarder les données dans localStorage
export const STORAGE_KEYS = {
  token:      'metereye_token',
  role:       'metereye_role',
  nomComplet: 'metereye_nom',
  userId:     'metereye_userId',
};
