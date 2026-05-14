export interface SousCompteurResponse {
  id:                  number;
  reference:           string;
  descriptionLogement: string;
  valeurInitiale:      number;
  valeurActuelle:      number;
  locataireId?:        number;
  locataireNom?:       string;
  actif:               boolean;
  dateCreation?:       string;
}
