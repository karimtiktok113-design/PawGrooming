import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { ClientProfile, AdminNotification } from '../types/auth';
import { compressDataUrl } from '../utils/imageCompressor';

// 1. Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Initialize Firestore with specific firestoreDatabaseId (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// 3. Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Test Connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Connected to live Firebase Firestore database!');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is restricted.');
    } else {
      console.log('Firebase connection active.');
    }
    return false;
  }
}

/**
 * Recursively cleans an object or array for Firestore writes by removing any fields whose values are `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }

  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }

  if (typeof data === 'object') {
    if (data instanceof Date) {
      return data;
    }
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }

  return data;
}

// 5. Firestore Collection Reference
export const PROFILES_COLLECTION = 'client_profiles';
export const ADMIN_COLLECTION = 'admin_config';

/**
 * Fetch all client profiles directly from Firestore online database
 */
export async function getOnlineFirestoreProfiles(): Promise<ClientProfile[]> {
  try {
    const snap = await getDocs(collection(db, PROFILES_COLLECTION));
    const profiles: ClientProfile[] = [];
    snap.forEach(docSnap => {
      profiles.push(docSnap.data() as ClientProfile);
    });
    return profiles;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, PROFILES_COLLECTION);
    return [];
  }
}

/**
 * Save or Update a client profile in Firestore online database
 */
export async function saveProfileToFirestore(profile: ClientProfile): Promise<void> {
  try {
    const sanitizedProfile = { ...profile };
    // Prevent giant raw base64 image strings from exceeding Firestore 1MB document limit
    if (sanitizedProfile.customSettings?.photo && sanitizedProfile.customSettings.photo.startsWith('data:image/')) {
      const compressed = await compressDataUrl(sanitizedProfile.customSettings.photo, 400, 400, 0.75);
      sanitizedProfile.customSettings = {
        ...sanitizedProfile.customSettings,
        photo: compressed
      };
    }

    const ref = doc(db, PROFILES_COLLECTION, profile.profileId);
    
    // Extra safety guard for Firestore 1MB max document limit
    const jsonStr = JSON.stringify(sanitizedProfile);
    if (jsonStr.length > 800000 && sanitizedProfile.customSettings?.photo) {
      // Fallback photo to clean URL if custom data URL is oversized
      sanitizedProfile.customSettings = {
        ...sanitizedProfile.customSettings,
        photo: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=240&q=80'
      };
    }

    const payloadToWrite = sanitizeForFirestore(sanitizedProfile);
    await setDoc(ref, payloadToWrite, { merge: true });
    console.log(`Saved/Updated profile ${profile.profileId} (${profile.businessName}) to Firebase Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${PROFILES_COLLECTION}/${profile.profileId}`);
  }
}

/**
 * Directly mark a client profile as offline in Firestore
 */
export async function markProfileOfflineInFirestore(profileId: string, sessionId?: string): Promise<void> {
  try {
    const ref = doc(db, PROFILES_COLLECTION, profileId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    
    const existing = snap.data() as ClientProfile;
    const now = new Date().toISOString();
    let updatedSessions = Array.isArray(existing.activeSessions) ? [...existing.activeSessions] : [];
    
    if (sessionId) {
      updatedSessions = updatedSessions.map(s => 
        s.sessionId === sessionId ? { ...s, status: 'inactive' as const, lastActiveAt: now } : s
      );
    } else {
      updatedSessions = updatedSessions.map(s => ({ ...s, status: 'inactive' as const, lastActiveAt: now }));
    }

    const hasAnyOtherActive = updatedSessions.some(s => s.status === 'active');

    const updatePayload = sanitizeForFirestore({
      isCurrentlyLoggedIn: hasAnyOtherActive,
      lastActiveAt: now,
      activeSessions: updatedSessions
    });

    await setDoc(ref, updatePayload, { merge: true });
    console.log(`Marked profile ${profileId} as offline in Firestore.`);
  } catch (err) {
    console.warn(`Failed to mark profile ${profileId} offline:`, err);
  }
}

/**
 * Directly update client presence heartbeat in Firestore
 */
export async function updateProfileHeartbeatInFirestore(profileId: string, sessionId?: string): Promise<void> {
  try {
    const ref = doc(db, PROFILES_COLLECTION, profileId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const existing = snap.data() as ClientProfile;
    const now = new Date().toISOString();
    let updatedSessions = Array.isArray(existing.activeSessions) ? [...existing.activeSessions] : [];

    if (sessionId) {
      updatedSessions = updatedSessions.map(s =>
        s.sessionId === sessionId ? { ...s, status: 'active' as const, lastActiveAt: now } : s
      );
    }

    const updatePayload = sanitizeForFirestore({
      isCurrentlyLoggedIn: true,
      lastActiveAt: now,
      activeSessions: updatedSessions
    });

    await setDoc(ref, updatePayload, { merge: true });
  } catch (err) {
    console.warn(`Failed to update heartbeat for profile ${profileId}:`, err);
  }
}

/**
 * Delete a client profile from Firestore online database
 */
export async function deleteProfileFromFirestore(profileId: string): Promise<void> {
  try {
    const ref = doc(db, PROFILES_COLLECTION, profileId);
    await deleteDoc(ref);
    console.log(`Deleted profile ${profileId} from Firebase Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${PROFILES_COLLECTION}/${profileId}`);
  }
}

/**
 * Direct Firebase Firestore Authentication for Client Login
 */
export async function authenticateWithFirestore(
  email: string, 
  password: string
): Promise<{ 
  success: boolean; 
  profile?: ClientProfile; 
  status?: 'active' | 'inactive' | 'invalid'; 
  error?: string 
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  try {
    const snap = await getDocs(collection(db, PROFILES_COLLECTION));
    let matchedProfile: ClientProfile | null = null;
    let foundEmail = false;

    snap.forEach(docSnap => {
      const p = docSnap.data() as ClientProfile;
      if (p.email && p.email.trim().toLowerCase() === cleanEmail) {
        foundEmail = true;
        if (p.password === cleanPass) {
          matchedProfile = p;
        }
      }
    });

    if (matchedProfile) {
      const p = matchedProfile as ClientProfile;
      if (p.status === 'inactive') {
        return {
          success: false,
          status: 'inactive',
          profile: p,
          error: 'Your account is currently inactive. Please contact support.'
        };
      }
      return {
        success: true,
        status: 'active',
        profile: p
      };
    }

    if (foundEmail) {
      return {
        success: false,
        status: 'invalid',
        error: 'Incorrect password for this account. Please check case sensitivity.'
      };
    }
  } catch (err) {
    console.warn('Direct Firestore authentication notice:', err);
  }

  return {
    success: false,
    status: 'invalid',
    error: 'No registered client profile found for this email address.'
  };
}

/**
 * Real-time listener for Firestore profiles across all connected devices.
 * Automatically fetches changes when manual edits occur in the Firebase Console!
 */
export function subscribeToOnlineFirestoreProfiles(
  onUpdate: (profiles: ClientProfile[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, PROFILES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: ClientProfile[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as ClientProfile);
      });
      // Always pass the live array directly from Firestore!
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore realtime snapshot listener notice:', error);
      if (onError) onError(error);
    }
  );
}

// 6. Firestore Broadcasts / Push Notifications Collection Reference
export const BROADCASTS_COLLECTION = 'admin_broadcasts';

/**
 * Fetch all admin broadcasts & push notifications from Firestore
 */
export async function getOnlineFirestoreNotifications(): Promise<AdminNotification[]> {
  try {
    const snap = await getDocs(collection(db, BROADCASTS_COLLECTION));
    const list: AdminNotification[] = [];
    snap.forEach(docSnap => {
      list.push(docSnap.data() as AdminNotification);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Could not fetch notifications from Firestore:', err);
    return [];
  }
}

/**
 * Save or Update an admin broadcast / push notification in Firestore
 */
export async function saveNotificationToFirestore(notification: AdminNotification): Promise<void> {
  try {
    const ref = doc(db, BROADCASTS_COLLECTION, notification.id);
    const cleanNotification = sanitizeForFirestore(notification);
    await setDoc(ref, cleanNotification, { merge: true });
    console.log(`Saved notification ${notification.id} to Firebase Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${BROADCASTS_COLLECTION}/${notification.id}`);
  }
}

/**
 * Delete an admin notification from Firestore
 */
export async function deleteNotificationFromFirestore(notificationId: string): Promise<void> {
  try {
    const ref = doc(db, BROADCASTS_COLLECTION, notificationId);
    await deleteDoc(ref);
    console.log(`Deleted notification ${notificationId} from Firebase Firestore.`);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${BROADCASTS_COLLECTION}/${notificationId}`);
  }
}

/**
 * Mark a notification as read/seen for a profile in Firestore
 */
export async function markNotificationReadInFirestore(notificationId: string, profileId: string): Promise<void> {
  try {
    const ref = doc(db, BROADCASTS_COLLECTION, notificationId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdminNotification;
      const readBy = Array.isArray(data.readBy) ? data.readBy : [];
      if (!readBy.includes(profileId)) {
        const updatePayload = sanitizeForFirestore({ readBy: [...readBy, profileId] });
        await setDoc(ref, updatePayload, { merge: true });
      }
    }
  } catch (err) {
    console.warn(`Could not mark notification read:`, err);
  }
}

/**
 * Mark a notification pop-up as dismissed for a profile in Firestore
 */
export async function markNotificationDismissedInFirestore(notificationId: string, profileId: string): Promise<void> {
  try {
    const ref = doc(db, BROADCASTS_COLLECTION, notificationId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as AdminNotification;
      const dismissedBy = Array.isArray(data.dismissedBy) ? data.dismissedBy : [];
      if (!dismissedBy.includes(profileId)) {
        const updatePayload = sanitizeForFirestore({ dismissedBy: [...dismissedBy, profileId] });
        await setDoc(ref, updatePayload, { merge: true });
      }
    }
  } catch (err) {
    console.warn(`Could not mark notification dismissed:`, err);
  }
}

/**
 * Real-time listener for Firestore Admin Broadcasts / Push Notifications
 */
export function subscribeToOnlineFirestoreNotifications(
  onUpdate: (notifications: AdminNotification[]) => void,
  onError?: (err: any) => void
) {
  const colRef = collection(db, BROADCASTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const list: AdminNotification[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as AdminNotification);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.warn('Firestore realtime notification listener notice:', error);
      if (onError) onError(error);
    }
  );
}

