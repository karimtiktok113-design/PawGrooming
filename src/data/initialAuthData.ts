import { AuthDatabase, ClientProfile, AdminUser } from '../types/auth';

export const AUTH_STORAGE_KEY = 'paw_grooming_auth_db_v2';
export const SESSION_STORAGE_KEY = 'paw_grooming_auth_session_v2';

export const INITIAL_ADMIN: AdminUser = {
  "id": "adm_01",
  "name": "Park SuperAdmin",
  "email": "admin@parkgrooming.com",
  "password": "admin123",
  "role": "super_admin",
  "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  "lastLogin": "2026-08-19"
};

export const INITIAL_PROFILES: ClientProfile[] = [];

export const INITIAL_AUTH_DATABASE: AuthDatabase = {
  admin: INITIAL_ADMIN,
  profiles: [],
  version: '2.0.0',
  lastUpdated: new Date().toISOString()
};

// Helper: load auth database from localStorage
export function loadAuthDatabase(): AuthDatabase {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse saved auth database:', err);
  }
  return INITIAL_AUTH_DATABASE;
}

// Helper: save auth database to localStorage
export function saveAuthDatabase(db: AuthDatabase): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save auth database to localStorage:', err);
  }
}

// Helper: Generate next unique Profile ID
export function generateNextProfileId(profiles: ClientProfile[]): string {
  const existingNumbers = profiles
    .map(p => {
      const match = p.profileId.match(/^PG(\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  return `PG${String(maxNum + 1).padStart(3, '0')}`;
}

// Helper: Generate temporary random secure password
export function generateSuggestedPassword(): string {
  const words = ['Groom', 'Paws', 'Fluffy', 'Clean', 'Bark', 'Shine', 'Tail', 'Happy'];
  const symbols = ['@', '#', '$', '!'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${word}${sym}${num}`;
}
