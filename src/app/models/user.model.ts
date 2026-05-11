// 🔄 MODIFIÉ — user.model.ts — corrections: AuthResponse champs nomComplet/userId alignés backend

export interface AuthResponse {
  token:     string;
  role:      string;
  nomComplet: string;
  userId:    number;
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
  nom:                   string;
  prenom:                string;
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

export interface UserState {
  isLoggedIn: boolean;
  user:       AuthResponse | null;
}
