// ✅ CRÉÉ — alerte.model.ts

export type TypeAlerte =
  | 'NOUVEAU_RELEVE'
  | 'CREDIT_FAIBLE'
  | 'COUPURE_IMMINENTE'
  | 'ANOMALIE_CONSOMMATION'
  | 'RAPPORT_DISPONIBLE'
  | 'CONNEXION_UTILISATEUR'
  | 'APPAREIL_HORS_LIGNE'
  | 'APPAREIL_RECONNECTE';

export interface AlerteResponse {
  id:                 number;
  typeAlerte:         TypeAlerte;
  message:            string;
  lue:                boolean;
  dateCreation:       string;
  compteurId:         number;
  compteurReference:  string;
}

export interface NotificationResponse {
  id:          number;
  titre:       string;
  contenu:     string;
  lue:         boolean;
  dateCreation: string;
}

export interface NotificationPreferences {
  push:  boolean;
  sms:   boolean;
  email: boolean;
}
