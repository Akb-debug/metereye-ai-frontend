// 🔄 MODIFIÉ — app.config.api.ts — corrections: endpoints devices ajoutés, bluetooth supprimé

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
  compteurs:    `${BASE}/compteurs`,
  compteur:     (id: number) => `${BASE}/compteurs/${id}`,
  modeLecture:  (id: number) => `${BASE}/compteurs/${id}/mode-lecture`,
  stats:        (id: number, periode: string) => `${BASE}/compteurs/${id}/stats?periode=${periode}`,
  statutConfig: (id: number) => `${BASE}/compteurs/${id}/statut-configuration`,
  releveManuel: `${BASE}/compteurs/releves`,
  recharge:     `${BASE}/compteurs/recharge`,

  // Maisons
  maisons:      `${BASE}/maisons`,
  maison:       (id: number) => `${BASE}/maisons/${id}`,

  // Readings
  readingsManual:  `${BASE}/readings/manual`,
  readingsByMeter: (id: number) => `${BASE}/readings/meters/${id}`,
  latestReading:   (id: number) => `${BASE}/readings/meters/${id}/latest`,

  // Alertes
  alertes:        `${BASE}/alertes`,
  alertesNonLues: `${BASE}/alertes/non-lues`,
  alerteLue:      (id: number) => `${BASE}/alertes/${id}/lue`,
  alertesToutLu:  `${BASE}/alertes/tout-lu`,

  // Notifications
  notifications:    `${BASE}/notifications`,
  notifPreferences: `${BASE}/notification-preferences`,

  // Devices IoT (ESP32-CAM, PZEM)
  deviceScan:     `${BASE}/devices/scan`,
  deviceAssociate: (code: string) => `${BASE}/devices/${code}/associate`,
  deviceStatus:   (code: string) => `${BASE}/devices/${code}/status`,
  myDevices:      `${BASE}/devices/my`,

  // User
  profil:          `${BASE}/users/profile`,
  updateSeuils:    `${BASE}/users/seuils`,
  updateNotifs:    `${BASE}/users/notifications`,
  changePassword:  `${BASE}/users/password`,
  
  // Sous-compteurs (Additionneuses) & Locataires
  sousCompteurs:        `${BASE}/sous-compteurs`,
  sousCompteursMaison:  (id: number) => `${BASE}/sous-compteurs/maison/${id}`,
  creerLocataire:       `${BASE}/sous-compteurs/locataires`,
  locatairesMaison:     (id: number) => `${BASE}/sous-compteurs/locataires/maison/${id}`,
  desactiverLocataire:  (id: number) => `${BASE}/sous-compteurs/locataires/${id}`,

  // Facturation / Répartition
  repartitionApercu: (maisonId: number, mois: number, annee: number, montant: number) => 
    `${BASE}/repartition/apercu?maisonId=${maisonId}&mois=${mois}&annee=${annee}&montantFacturePrincipale=${montant}`,
  repartitionGenerer: `${BASE}/repartition/generer`,
  repartitionMaison: (maisonId: number, mois: number, annee: number) => 
    `${BASE}/repartition/maison/${maisonId}?mois=${mois}&annee=${annee}`,
};

export const STORAGE_KEYS = {
  token:        'metereye_token',
  role:         'metereye_role',
  nomComplet:   'metereye_nom',
  userId:       'metereye_userId',
  compteurId:   'metereye_compteurId',
  typeCompteur: 'metereye_typeCompteur',
};
