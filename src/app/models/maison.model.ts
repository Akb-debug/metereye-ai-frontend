export interface MaisonRequest {
  nom:                  string;
  adresse:              string;
  description?:         string;
  compteurPrincipalId?: number;
}

export interface MaisonResponse {
  id:            number;
  nom:           string;
  adresse:       string;
  description:   string;
  createdAt:     string;
  compteurPrincipalId?: number;
  compteurPrincipalReference?: string;
  typeCompteur?: string;
  nombreLocataires?: number;
  sousCompteurs?: any[];
}
