// 🔄 MODIFIÉ — user.model.ts — ajouts : UserProfile, NotificationPreferences, UserState étendu

export interface AuthResponse {
  token:     string;
  type:      string;
  id:        number;
  email:     string;
  role:      string;
  nom:       string;
  prenom:    string;
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

export interface UserState {
  isLoggedIn: boolean;
  user:       AuthResponse | null;
}
