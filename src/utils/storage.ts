import {
    collection, doc, getDocs, setDoc, deleteDoc, writeBatch,
    query, orderBy, limit,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, firebaseAuth } from './firebase';

// ============================================
// AUTH
// ============================================

export async function ensureAuth(): Promise<string> {
    const user = firebaseAuth.currentUser;
    if (user) return user.uid;

    const cred = await signInAnonymously(firebaseAuth);
    return cred.user.uid;
}

export function getCurrentUserId(): string | null {
    return firebaseAuth.currentUser?.uid ?? null;
}

// ============================================
// DATA TYPES
// ============================================

export interface CigaretteLog {
    id: string;
    timestamp: number;
}

export interface UserSettings {
    dailyLimit: number;
    packPrice: number;
    cigarettesPerPack: number;
    userName: string;
    createdAt: number;
}

export interface Achievement {
    id: string;
    type: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: number | null;
    progress: number;
    target: number;
}

export interface AdminNotification {
    id: string;
    title: string;
    body: string;
    sentAt: number;
}

const DEFAULT_SETTINGS: UserSettings = {
    dailyLimit: 20,
    packPrice: 75,
    cigarettesPerPack: 20,
    userName: '',
    createdAt: Date.now(),
};

// ============================================
// CIGARETTE LOGS
// ============================================

export async function getLogs(uid: string): Promise<CigaretteLog[]> {
    try {
        const ref = collection(db, 'users', uid, 'cigaretteLogs');
        const q = query(ref, orderBy('timestamp', 'asc'));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as CigaretteLog));
    } catch {
        return [];
    }
}

export async function addLog(uid: string): Promise<CigaretteLog> {
    const newLog: CigaretteLog = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        timestamp: Date.now(),
    };
    const ref = doc(db, 'users', uid, 'cigaretteLogs', newLog.id);
    await setDoc(ref, newLog);
    return newLog;
}

export async function removeLastLog(uid: string, logs: CigaretteLog[]): Promise<void> {
    if (logs.length === 0) return;
    const last = logs[logs.length - 1];
    const ref = doc(db, 'users', uid, 'cigaretteLogs', last.id);
    await deleteDoc(ref);
}

// ============================================
// USER SETTINGS
// ============================================

export async function getSettings(uid: string): Promise<UserSettings> {
    try {
        const { getDoc } = await import('firebase/firestore');
        const ref = doc(db, 'users', uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            return {
                dailyLimit: data?.dailyLimit ?? DEFAULT_SETTINGS.dailyLimit,
                packPrice: data?.packPrice ?? DEFAULT_SETTINGS.packPrice,
                cigarettesPerPack: data?.cigarettesPerPack ?? DEFAULT_SETTINGS.cigarettesPerPack,
                userName: data?.userName ?? DEFAULT_SETTINGS.userName,
                createdAt: data?.createdAt ?? DEFAULT_SETTINGS.createdAt,
            };
        }
        // First time – create defaults
        await setDoc(ref, DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function saveSettings(uid: string, settings: UserSettings): Promise<void> {
    const ref = doc(db, 'users', uid);
    await setDoc(ref, settings, { merge: true });
}

// ============================================
// ACHIEVEMENTS
// ============================================

export async function getAchievements(uid: string): Promise<Achievement[]> {
    try {
        const ref = collection(db, 'users', uid, 'achievements');
        const snap = await getDocs(ref);
        return snap.docs.map(d => d.data() as Achievement);
    } catch {
        return [];
    }
}

export async function saveAchievements(uid: string, achievements: Achievement[]): Promise<void> {
    const batch = writeBatch(db);
    for (const ach of achievements) {
        const ref = doc(db, 'users', uid, 'achievements', ach.id);
        batch.set(ref, ach);
    }
    await batch.commit();
}

// ============================================
// ADMIN NOTIFICATIONS (global collection)
// ============================================

export async function getAdminNotifications(): Promise<AdminNotification[]> {
    try {
        const ref = collection(db, 'adminNotifications');
        const q = query(ref, orderBy('sentAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNotification));
    } catch {
        return [];
    }
}

export async function saveAdminNotification(notif: AdminNotification): Promise<void> {
    const ref = doc(db, 'adminNotifications', notif.id);
    await setDoc(ref, notif);
}

// ============================================
// CLEAR ALL USER DATA
// ============================================

export async function clearAllData(uid: string): Promise<void> {
    try {
        // Delete logs
        const logsRef = collection(db, 'users', uid, 'cigaretteLogs');
        const logSnap = await getDocs(logsRef);
        const batch1 = writeBatch(db);
        logSnap.docs.forEach(d => batch1.delete(d.ref));
        await batch1.commit();

        // Delete achievements
        const achRef = collection(db, 'users', uid, 'achievements');
        const achSnap = await getDocs(achRef);
        const batch2 = writeBatch(db);
        achSnap.docs.forEach(d => batch2.delete(d.ref));
        await batch2.commit();

        // Reset user settings
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, DEFAULT_SETTINGS);
    } catch (e) {
        console.warn('Clear data error', e);
    }
}
