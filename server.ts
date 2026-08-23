import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Enable CORS and JSON parsing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Persistent database file paths
const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DATA_DIR = path.join(process.cwd(), 'src', 'data');

const DB_FILE = path.join(DATA_DIR, 'auth_db.json');
const PUBLIC_DB_FILE = path.join(PUBLIC_DIR, 'auth_db.json');
const SRC_REGISTERED_PROFILES_FILE = path.join(SRC_DATA_DIR, 'registeredProfiles.ts');
const SRC_INITIAL_AUTH_DATA_FILE = path.join(SRC_DATA_DIR, 'initialAuthData.ts');

// Clean initial database configuration (pure Firebase synchronization, no hardcoded profiles)
const DEFAULT_AUTH_DB = {
  admin: {
    id: 'adm_01',
    name: 'Paw SuperAdmin',
    email: 'admin@parkgrooming.com',
    password: 'admin123',
    role: 'super_admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    lastLogin: '2026-08-19'
  },
  profiles: [],
  version: '2.0.0',
  lastUpdated: new Date().toISOString()
};

// Ensure directories exist
[DATA_DIR, PUBLIC_DIR, SRC_DATA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true });
    } catch (e) {
      console.error(`Failed to create directory ${dir}:`, e);
    }
  }
});

// Helper: Generate TypeScript for registeredProfiles.ts
function generateRegisteredProfilesTs(profiles: any[]): string {
  return `import { ClientProfile } from '../types/auth';

/**
 * PAW GROOMING — CLIENT PROFILES REPOSITORY
 * Synchronized with Firebase Firestore Database.
 */
export const DEFAULT_REGISTERED_PROFILES: ClientProfile[] = ${JSON.stringify(profiles, null, 2)};
`;
}

// Helper: Generate TypeScript for initialAuthData.ts
function generateInitialAuthDataTs(admin: any, version: string, lastUpdated: string): string {
  return `import { AuthDatabase, ClientProfile, AdminUser } from '../types/auth';
import { DEFAULT_REGISTERED_PROFILES } from './registeredProfiles';

export const AUTH_STORAGE_KEY = 'paw_grooming_auth_db_v2';
export const SESSION_STORAGE_KEY = 'paw_grooming_auth_session_v2';

export const INITIAL_ADMIN: AdminUser = ${JSON.stringify(admin, null, 2)};

export const INITIAL_PROFILES: ClientProfile[] = DEFAULT_REGISTERED_PROFILES;

export const INITIAL_AUTH_DATABASE: AuthDatabase = {
  admin: INITIAL_ADMIN,
  profiles: INITIAL_PROFILES,
  version: '${version || "2.0.0"}',
  lastUpdated: '${lastUpdated || new Date().toISOString()}'
};

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

export function saveAuthDatabase(db: AuthDatabase): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save auth database to localStorage:', err);
  }
}

export function generateNextProfileId(profiles: ClientProfile[]): string {
  const existingNumbers = profiles
    .map(p => {
      const match = p.profileId.match(/^PG(\\d+)$/i);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
  return \`PG\${String(maxNum + 1).padStart(3, '0')}\`;
}

export function generateSuggestedPassword(): string {
  const words = ['Paws', 'Bark', 'Groom', 'Studio', 'Shampoo', 'Fluffy', 'Happy', 'Puppy'];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  return \`\${randomWord}@\${randomNum}\`;
}
`;
}

// Helper: Read DB from disk
function readServerAuthDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    } else if (fs.existsSync(PUBLIC_DB_FILE)) {
      const content = fs.readFileSync(PUBLIC_DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read auth_db.json, using default:', err);
  }
  writeServerAuthDb(DEFAULT_AUTH_DB);
  return DEFAULT_AUTH_DB;
}

// Helper: Write DB to persistent storage
function writeServerAuthDb(data: any) {
  currentDb = data;
  const jsonStr = JSON.stringify(data, null, 2);

  try {
    fs.writeFileSync(DB_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Failed to write data/auth_db.json:', err);
  }

  try {
    fs.writeFileSync(PUBLIC_DB_FILE, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Failed to write public/auth_db.json:', err);
  }

  try {
    fs.writeFileSync(SRC_REGISTERED_PROFILES_FILE, generateRegisteredProfilesTs(data.profiles), 'utf-8');
  } catch (err) {
    console.error('Failed to write src/data/registeredProfiles.ts:', err);
  }

  try {
    fs.writeFileSync(SRC_INITIAL_AUTH_DATA_FILE, generateInitialAuthDataTs(data.admin, data.version, data.lastUpdated), 'utf-8');
  } catch (err) {
    console.error('Failed to write src/data/initialAuthData.ts:', err);
  }
}

// In-memory reference initialized from disk
let currentDb = readServerAuthDb();

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 2. Fetch full Auth Database
app.get('/api/auth/db', (req, res) => {
  currentDb = readServerAuthDb();
  res.json(currentDb);
});

// 3. Client login verification
app.post('/api/auth/client-login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanPass = String(password).trim();

  currentDb = readServerAuthDb();

  const matched = currentDb.profiles.find(
    (p: any) => p.email.toLowerCase() === cleanEmail && p.password === cleanPass
  );

  if (!matched) {
    const emailExists = currentDb.profiles.some(
      (p: any) => p.email.toLowerCase() === cleanEmail
    );
    if (emailExists) {
      return res.status(401).json({
        success: false,
        status: 'invalid',
        error: 'Incorrect password for this account. Please verify case-sensitivity.'
      });
    }

    return res.status(401).json({
      success: false,
      status: 'invalid',
      error: 'No registered client profile found for this email address.'
    });
  }

  if (matched.status === 'inactive') {
    return res.status(403).json({
      success: false,
      status: 'inactive',
      error: 'Your account is currently inactive. Please contact support.',
      profile: matched
    });
  }

  res.json({
    success: true,
    status: 'active',
    profile: matched,
    token: `token_${matched.profileId}_${Date.now()}`
  });
});

// 4. Admin login verification
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  currentDb = readServerAuthDb();

  if (
    cleanEmail === currentDb.admin.email.toLowerCase() &&
    cleanPass === currentDb.admin.password
  ) {
    return res.json({
      success: true,
      admin: currentDb.admin,
      token: `admin_token_${Date.now()}`
    });
  }

  res.status(401).json({
    success: false,
    error: 'Invalid admin credentials. Please verify your email and password.'
  });
});

// 5. Create new client profile
app.post('/api/auth/profiles', (req, res) => {
  try {
    const newProfileData = req.body;
    if (!newProfileData || !newProfileData.businessName || !newProfileData.email || !newProfileData.password) {
      return res.status(400).json({ error: 'Missing required profile fields.' });
    }

    currentDb = readServerAuthDb();

    let profileId = newProfileData.profileId;
    if (!profileId) {
      const existingNums = currentDb.profiles
        .map((p: any) => {
          const match = p.profileId.match(/^PG(\d+)$/i);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n: number) => !isNaN(n));
      const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
      profileId = `PG${String(maxNum + 1).padStart(3, '0')}`;
    }

    const today = new Date().toISOString().split('T')[0];
    const newProfile = {
      ...newProfileData,
      profileId,
      createdAt: newProfileData.createdAt || today,
      status: newProfileData.status || 'active',
      plan: newProfileData.plan || 'Premium',
      customSettings: newProfileData.customSettings || {
        salonName: newProfileData.businessName,
        name: `${newProfileData.businessName} Studio`,
        email: newProfileData.email,
        phone: newProfileData.phoneNumber || '(555) 000-0000',
        colorTheme: 'terracotta'
      }
    };

    const filteredExisting = currentDb.profiles.filter(
      (p: any) => p.profileId !== profileId && p.email.toLowerCase() !== newProfile.email.toLowerCase()
    );

    const updatedDb = {
      ...currentDb,
      profiles: [newProfile, ...filteredExisting],
      lastUpdated: new Date().toISOString()
    };

    writeServerAuthDb(updatedDb);
    res.status(201).json({ success: true, profile: newProfile, database: updatedDb });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to create profile on server.' });
  }
});

// 6. Update existing client profile
app.put('/api/auth/profiles/:profileId', (req, res) => {
  const { profileId } = req.params;
  const updates = req.body;

  currentDb = readServerAuthDb();
  let found = false;

  const updatedProfiles = currentDb.profiles.map((p: any) => {
    if (p.profileId === profileId) {
      found = true;
      const updated = { ...p, ...updates };
      if (updates.businessName && updated.customSettings) {
        updated.customSettings.salonName = updates.businessName;
      }
      return updated;
    }
    return p;
  });

  if (!found) {
    return res.status(404).json({ error: `Profile ${profileId} not found.` });
  }

  const updatedDb = {
    ...currentDb,
    profiles: updatedProfiles,
    lastUpdated: new Date().toISOString()
  };

  writeServerAuthDb(updatedDb);
  res.json({ success: true, database: updatedDb });
});

// 7. Toggle Profile status (active/inactive)
app.patch('/api/auth/profiles/:profileId/toggle-status', (req, res) => {
  const { profileId } = req.params;
  let nextStatus = 'active';

  currentDb = readServerAuthDb();
  let found = false;

  const updatedProfiles = currentDb.profiles.map((p: any) => {
    if (p.profileId === profileId) {
      found = true;
      nextStatus = p.status === 'active' ? 'inactive' : 'active';
      return { ...p, status: nextStatus };
    }
    return p;
  });

  if (!found) {
    return res.status(404).json({ error: `Profile ${profileId} not found.` });
  }

  const updatedDb = {
    ...currentDb,
    profiles: updatedProfiles,
    lastUpdated: new Date().toISOString()
  };

  writeServerAuthDb(updatedDb);
  res.json({ success: true, newStatus: nextStatus, database: updatedDb });
});

// 8. Delete Profile
app.delete('/api/auth/profiles/:profileId', (req, res) => {
  const { profileId } = req.params;
  currentDb = readServerAuthDb();

  const updatedDb = {
    ...currentDb,
    profiles: currentDb.profiles.filter((p: any) => p.profileId !== profileId),
    lastUpdated: new Date().toISOString()
  };

  writeServerAuthDb(updatedDb);
  res.json({ success: true, database: updatedDb });
});

// 9. Presence endpoints (for navigator.sendBeacon & keepalive on browser close)
app.post('/api/presence/offline', (req, res) => {
  try {
    const { profileId, sessionId } = req.body || {};
    if (profileId) {
      currentDb = readServerAuthDb();
      const updatedProfiles = currentDb.profiles.map((p: any) => {
        if (p.profileId === profileId) {
          const now = new Date().toISOString();
          let updatedSessions = Array.isArray(p.activeSessions) ? [...p.activeSessions] : [];
          if (sessionId) {
            updatedSessions = updatedSessions.map((s: any) =>
              s.sessionId === sessionId ? { ...s, status: 'inactive', lastActiveAt: now } : s
            );
          } else {
            updatedSessions = updatedSessions.map((s: any) => ({ ...s, status: 'inactive', lastActiveAt: now }));
          }
          const hasAnyOtherActive = updatedSessions.some((s: any) => s.status === 'active');
          return {
            ...p,
            isCurrentlyLoggedIn: hasAnyOtherActive,
            lastActiveAt: now,
            activeSessions: updatedSessions
          };
        }
        return p;
      });
      writeServerAuthDb({ ...currentDb, profiles: updatedProfiles, lastUpdated: new Date().toISOString() });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

app.post('/api/presence/heartbeat', (req, res) => {
  try {
    const { profileId, sessionId } = req.body || {};
    if (profileId) {
      currentDb = readServerAuthDb();
      const updatedProfiles = currentDb.profiles.map((p: any) => {
        if (p.profileId === profileId) {
          const now = new Date().toISOString();
          let updatedSessions = Array.isArray(p.activeSessions) ? [...p.activeSessions] : [];
          if (sessionId) {
            updatedSessions = updatedSessions.map((s: any) =>
              s.sessionId === sessionId ? { ...s, status: 'active', lastActiveAt: now } : s
            );
          }
          return {
            ...p,
            isCurrentlyLoggedIn: true,
            lastActiveAt: now,
            activeSessions: updatedSessions
          };
        }
        return p;
      });
      writeServerAuthDb({ ...currentDb, profiles: updatedProfiles, lastUpdated: new Date().toISOString() });
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err?.message });
  }
});

// 10. Reset database
app.post('/api/auth/reset', (req, res) => {
  const updatedDb = {
    ...DEFAULT_AUTH_DB,
    lastUpdated: new Date().toISOString()
  };
  writeServerAuthDb(updatedDb);
  res.json({ success: true, database: updatedDb });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC ASSET SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Paw Grooming Server running globally on port ${PORT}`);
  });
}

startServer();
