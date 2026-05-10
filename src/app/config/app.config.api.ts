// 🔄 MODIFIÉ — app.config.api.ts — ajouts : tous les endpoints backend

const BASE = 'http://localhost:8080/api';

export const API_CONFIG = {
  baseUrl: BASE,
};

export const API_URLS = {
  // Auth
  login:    `${BASE}/auth/login`,
  register: `${BASE}/auth/register`,
  me:       `${BASE}/auth/me`,

  // Compteurs
  compteurs:         `${BASE}/compteurs`,
  compteur:          (id: number) => `${BASE}/compteurs/${id}`,
  modeLecture:       (id: number) => `${BASE}/compteurs/${id}/mode-lecture`,
  stats:             (id: number, periode: string) => `${BASE}/compteurs/${id}/stats?periode=${periode}`,
  statutConfig:      (id: number) => `${BASE}/compteurs/${id}/statut-configuration`,
  releveManuel:      `${BASE}/compteurs/releves`,
  recharge:          `${BASE}/compteurs/recharge`,

  // Readings
  readingsManual:    `${BASE}/readings/manual`,
  readingsByMeter:   (id: number) => `${BASE}/readings/meters/${id}`,
  latestReading:     (id: number) => `${BASE}/readings/meters/${id}/latest`,

  // Alertes
  alertes:           `${BASE}/alertes`,
  alertesNonLues:    `${BASE}/alertes/non-lues`,
  alerteLue:         (id: number) => `${BASE}/alertes/${id}/lue`,
  alertesToutLu:     `${BASE}/alertes/tout-lu`,

  // Notifications
  notifications:     `${BASE}/notifications`,
  notifPreferences:  `${BASE}/notification-preferences`,

  // Bluetooth
  bluetoothScan:     `${BASE}/bluetooth/scan`,
  bluetoothConfig:   `${BASE}/bluetooth/configure`,
  bluetoothDirect:   `${BASE}/bluetooth/direct-configure`,
  moduleStatus:      (code: string) => `${BASE}/module-devices/${code}/status`,

  // User
  profil:            `${BASE}/users/profile`,
  updateSeuils:      `${BASE}/users/seuils`,
  updateNotifs:      `${BASE}/users/notifications`,
};

export const STORAGE_KEYS = {
  token:      'metereye_token',
  role:       'metereye_role',
  nomComplet: 'metereye_nom',
  userId:     'metereye_userId',
  compteurId: 'metereye_compteurId',
  typeCompteur: 'metereye_typeCompteur',
};
