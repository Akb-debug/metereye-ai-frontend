// ✅ CRÉÉ — compteur.model.ts

export interface CompteurRequest {
  reference:    string;
  adresse:      string;
  typeCompteur: 'CLASSIQUE' | 'CASH_POWER';
}

export interface CompteurResponse {
  id:                   number;
  reference:            string;
  adresse:              string;
  typeCompteur:         'CLASSIQUE' | 'CASH_POWER';
  valeurActuelle:       number;
  proprietaireNom:      string;
  proprietaireId:       number;
  dateInitialisation:   string;
  actif:                boolean;
  dateCreation:         string;
}

export interface StatutConfig {
  compteurId:            number;
  modeLectureConfigure:  'MANUAL' | 'ESP32_CAM' | 'SENSOR' | null;
  moduleConnecte:        boolean;
  dernierReleve:         string | null;
}

export interface StatsResponse {
  labels:        string[];
  consommations: number[];
  total:         number;
  moyenne:       number;
}

export type ModeLecture = 'MANUAL' | 'ESP32_CAM' | 'SENSOR';
