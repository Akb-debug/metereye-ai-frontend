export interface SousCompteurResponse {
  id:                  number;
  reference:           string;
  descriptionLogement: string;
  valeurInitiale:      number;
  valeurActuelle:      number;
  maisonId?:           number;
  maisonNom?:          string;
  locataireId?:        number;
  locataireNom?:       string;
  locataireEmail?:     string;
  actif:               boolean;
  dateCreation?:       string;
  dernierReleve?:      any;
  dateDernierReleve?:  string | null;
}
