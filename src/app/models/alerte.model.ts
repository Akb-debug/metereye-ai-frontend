// 🔄 MODIFIÉ — alerte.model.ts — corrections: type au lieu de typeAlerte, compteur objet imbriqué

export type TypeAlerte =
  | 'SEUIL_CREDIT'
  | 'NOUVEAU_RELEVE'
  | 'ANOMALIE_CONSOMMATION'
  | 'RAPPORT_DISPONIBLE'
  | 'COUPURE_IMMINENTE'
  | 'APPAREIL_HORS_LIGNE'
  | 'APPAREIL_RECONNECTE';

export interface AlerteResponse {
  id:           number;
  type:         string;
  message:      string;
  lue:          boolean;
  dateCreation: string;
  compteur?:    { id: number; reference: string };
}

export interface NotificationResponse {
  id:           number;
  titre:        string;
  message:      string;
  dateCreation: string;
  type:         string;
  lue:          boolean;
}
