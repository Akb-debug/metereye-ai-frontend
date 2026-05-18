// 🔄 MODIFIÉ — user.model.ts — corrections: AuthResponse champs nomComplet/userId alignés backend

export interface AuthResponse {
  token:           string;
  role:            string;
  nomComplet:      string;
  userId:          number;
  sousCompteurId?: number;  // Renvoyé par le backend pour les LOCATAIRES
}

export interface LoginRequest {
  email:      string;
  motDePasse: string;
}

export interface RegisterRequest {
  nom:        string;
  prenom:     string;
  email:      string;
  motDePasse: string;
  telephone:  string;
  role:       string;
}

export interface UserProfile {
  id:                    number;
  nomComplet:            string;
  username:              string;
  email:                 string;
  telephone:             string;
  role:                  string;
  seuilAlerteCredit:     number;
  seuilAlerteAnomalie:   number;
  notificationPush:      boolean;
  notificationSms:       boolean;
  notificationEmail:     boolean;
}

export interface NotificationPreferences {
  pushEnabled:    boolean;
  emailEnabled:   boolean;
  smsEnabled:     boolean;
  creditAlerts:   boolean;
  anomalyAlerts:  boolean;
  systemAlerts:   boolean;
}

export interface ChangePasswordRequest {
  ancienMotDePasse:  string;
  nouveauMotDePasse: string;
}

export interface UserState {
  isLoggedIn: boolean;
  user:       AuthResponse | null;
}
