// Rôle : Définit les types TypeScript (interfaces) pour l'authentification.
// Cela garantit que les données correspondent exactement à ce qu'attend le backend.

// Ce que le backend renvoie après login ou register
export interface AuthResponse {
  token:      string;
  role:       string;
  nomComplet: string;
  userId:     number;
}

// Ce qu'on envoie au backend pour se connecter
export interface LoginRequest {
  email:      string;
  motDePasse: string;
}

// Ce qu'on envoie au backend pour s'inscrire
export interface RegisterRequest {
  nom:        string;
  prenom:     string;
  email:      string;
  motDePasse: string;
  telephone:  string;
  role:       string;
}

// État de connexion global dans l'application
export interface UserState {
  isLoggedIn: boolean;
  user:       AuthResponse | null;
}
