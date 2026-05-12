// 🔄 MODIFIÉ — compteur.model.ts — corrections: CompteurResponse statut+index, StatutConfig aligné backend, StatsResponse champs réels

export interface CompteurRequest {
  reference:      string;
  adresse:        string;
  typeCompteur:   'CLASSIQUE' | 'CASH_POWER';
  valeurInitiale: number;
}

export interface CompteurResponse {
  id:                    number;
  reference:             string;
  adresse:               string;
  typeCompteur:          'CLASSIQUE' | 'CASH_POWER';
  statut:                string;
  valeurActuelle:        number;
  indexInitial?:         number;
  indexPrecedent?:       number;
  modeLectureConfigure?: string;
  dateCreation:          string;
}

export interface StatutConfig {
  reference:              string;
  statut:                 string;
  modeLectureConfigure:   string;
  configurePourLecture:   boolean;
}

export interface StatsResponse {
  consommationJour:         number;
  consommationSemaine:      number;
  consommationMois:         number;
  consommationMoyenneJour:  number;
  creditRestant:            number;
  dateEstimationEpuisement: string;
  consommationParJour:      Record<string, number>;
}

export type ModeLecture = 'MANUAL' | 'ESP32_CAM' | 'SENSOR';
