import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
    CigaretteLog, UserSettings, Achievement, AdminNotification,
    getLogs, addLog as addLogFirestore, removeLastLog,
    getSettings, saveSettings,
    getAchievements, saveAchievements,
    getAdminNotifications, saveAdminNotification,
    ensureAuth, clearAllData,
} from '../utils/storage';
import { registerForPushNotifications, sendPushToAllUsers } from '../utils/notifications';

// Achievement definitions
const ACHIEVEMENT_DEFS = [
    { id: 'first_day', type: 'streak', title: 'İlk Adım', description: 'İlk gün limiti aşmadın!', icon: '🌟', target: 1 },
    { id: 'week_streak', type: 'streak', title: 'Bir Hafta', description: '7 gün üst üste limiti aşmadın', icon: '🔥', target: 7 },
    { id: 'month_streak', type: 'streak', title: 'Bir Ay', description: '30 gün üst üste limiti aşmadın', icon: '💪', target: 30 },
    { id: 'reduce_10', type: 'reduce', title: '10 Azalttın', description: 'Toplam 10 sigara azalttın', icon: '📉', target: 10 },
    { id: 'reduce_50', type: 'reduce', title: '50 Azalttın', description: 'Toplam 50 sigara azalttın', icon: '🎯', target: 50 },
    { id: 'reduce_100', type: 'reduce', title: '100 Azalttın', description: 'Toplam 100 sigara azalttın', icon: '🏆', target: 100 },
    { id: 'save_100', type: 'savings', title: '100₺ Tasarruf', description: '100₺ tasarruf ettin', icon: '💰', target: 100 },
    { id: 'save_500', type: 'savings', title: '500₺ Tasarruf', description: '500₺ tasarruf ettin', icon: '💎', target: 500 },
    { id: 'save_1000', type: 'savings', title: '1000₺ Tasarruf', description: '1000₺ tasarruf ettin', icon: '👑', target: 1000 },
    { id: 'crisis_1', type: 'crisis', title: 'Kriz Avcısı', description: 'İlk kriz modunu tamamladın', icon: '🛡️', target: 1 },
    { id: 'crisis_10', type: 'crisis', title: 'Kriz Ustası', description: '10 kriz modunu tamamladın', icon: '⚔️', target: 10 },
    { id: 'no_smoke_day', type: 'zero', title: 'Sıfır Gün!', description: 'Bir gün hiç sigara içmedin', icon: '🌈', target: 1 },
];

interface SmokingContextType {
    logs: CigaretteLog[];
    settings: UserSettings;
    achievements: Achievement[];
    notifications: AdminNotification[];
    todayCount: number;
    lastSmoke: number | null;
    isLoading: boolean;
    uid: string | null;
    addCigarette: () => Promise<void>;
    undoLastCigarette: () => Promise<void>;
    updateSettings: (s: Partial<UserSettings>) => Promise<void>;
    completeCrisis: () => Promise<void>;
    sendAdminNotification: (title: string, body: string) => Promise<void>;
    refreshData: () => Promise<void>;
    getTodayLogs: () => CigaretteLog[];
    getWeekData: () => { day: string; count: number }[];
    getDailyAverage: () => number;
    getTotalSaved: () => number;
}

const SmokingContext = createContext<SmokingContextType | null>(null);

export function useSmokingContext(): SmokingContextType {
    const ctx = useContext(SmokingContext);
    if (!ctx) throw new Error('useSmokingContext must be within SmokingProvider');
    return ctx;
}

function getStartOfDay(ts: number): number {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function getDayLabel(ts: number): string {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    return days[new Date(ts).getDay()];
}

export function SmokingProvider({ children }: { children: React.ReactNode }) {
    const [uid, setUid] = useState<string | null>(null);
    const [logs, setLogs] = useState<CigaretteLog[]>([]);
    const [settings, setSettings] = useState<UserSettings>({
        dailyLimit: 20,
        packPrice: 75,
        cigarettesPerPack: 20,
        userName: '',
        createdAt: Date.now(),
    });
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const crisisCountRef = useRef(0);

    // Authenticate and load data
    useEffect(() => {
        (async () => {
            try {
                const userId = await ensureAuth();
                setUid(userId);

                // Register for push notifications
                registerForPushNotifications(userId).catch(e =>
                    console.warn('Push registration failed:', e)
                );

                const [l, s, a, n] = await Promise.all([
                    getLogs(userId),
                    getSettings(userId),
                    getAchievements(userId),
                    getAdminNotifications(),
                ]);

                setLogs(l);
                setSettings(s);
                setNotifications(n);

                // Initialize achievements if empty
                if (a.length === 0) {
                    const initial: Achievement[] = ACHIEVEMENT_DEFS.map(d => ({
                        ...d,
                        unlockedAt: null,
                        progress: 0,
                    }));
                    await saveAchievements(userId, initial);
                    setAchievements(initial);
                } else {
                    setAchievements(a);
                }
            } catch (e) {
                console.warn('Init error', e);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const todayStart = getStartOfDay(Date.now());
    const todayLogs = logs.filter(l => l.timestamp >= todayStart);
    const todayCount = todayLogs.length;
    const lastSmoke = logs.length > 0 ? logs[logs.length - 1].timestamp : null;

    const getTodayLogs = useCallback(() => {
        const start = getStartOfDay(Date.now());
        return logs.filter(l => l.timestamp >= start);
    }, [logs]);

    const getWeekData = useCallback(() => {
        const now = Date.now();
        const result: { day: string; count: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const dayTs = now - i * 86400000;
            const dayStart = getStartOfDay(dayTs);
            const dayEnd = dayStart + 86400000;
            const count = logs.filter(l => l.timestamp >= dayStart && l.timestamp < dayEnd).length;
            result.push({ day: getDayLabel(dayTs), count });
        }
        return result;
    }, [logs]);

    const getDailyAverage = useCallback(() => {
        if (logs.length === 0) return 0;
        const firstLog = logs[0].timestamp;
        const days = Math.max(1, Math.ceil((Date.now() - firstLog) / 86400000));
        return Math.round((logs.length / days) * 10) / 10;
    }, [logs]);

    const getTotalSaved = useCallback(() => {
        if (logs.length === 0) return 0;
        const pricePerCig = settings.packPrice / settings.cigarettesPerPack;
        const firstLog = logs[0].timestamp;
        const days = Math.max(1, Math.ceil((Date.now() - firstLog) / 86400000));
        const expectedTotal = days * settings.dailyLimit;
        const saved = Math.max(0, expectedTotal - logs.length);
        return Math.round(saved * pricePerCig * 100) / 100;
    }, [logs, settings]);

    const checkAchievements = useCallback(async (updatedLogs: CigaretteLog[], crisisCount: number) => {
        if (!uid) return;
        const updated = [...achievements];
        let changed = false;

        for (const ach of updated) {
            if (ach.unlockedAt) continue;
            let progress = 0;

            if (ach.type === 'streak') {
                let streak = 0;
                for (let i = 0; i < 60; i++) {
                    const dayStart = getStartOfDay(Date.now() - i * 86400000);
                    const dayEnd = dayStart + 86400000;
                    const dayCount = updatedLogs.filter(l => l.timestamp >= dayStart && l.timestamp < dayEnd).length;
                    if (dayCount <= settings.dailyLimit && (dayCount > 0 || i === 0)) {
                        streak++;
                    } else break;
                }
                progress = streak;
            } else if (ach.type === 'reduce') {
                const firstLog = updatedLogs[0]?.timestamp || Date.now();
                const days = Math.max(1, Math.ceil((Date.now() - firstLog) / 86400000));
                const expectedTotal = days * settings.dailyLimit;
                progress = Math.max(0, expectedTotal - updatedLogs.length);
            } else if (ach.type === 'savings') {
                const pricePerCig = settings.packPrice / settings.cigarettesPerPack;
                const firstLog = updatedLogs[0]?.timestamp || Date.now();
                const days = Math.max(1, Math.ceil((Date.now() - firstLog) / 86400000));
                const expectedTotal = days * settings.dailyLimit;
                const saved = Math.max(0, expectedTotal - updatedLogs.length);
                progress = Math.round(saved * pricePerCig);
            } else if (ach.type === 'crisis') {
                progress = crisisCount;
            } else if (ach.type === 'zero') {
                for (let i = 1; i < 30; i++) {
                    const dStart = getStartOfDay(Date.now() - i * 86400000);
                    const dEnd = dStart + 86400000;
                    const dCount = updatedLogs.filter(l => l.timestamp >= dStart && l.timestamp < dEnd).length;
                    if (dCount === 0) { progress = 1; break; }
                }
            }

            if (progress !== ach.progress) {
                ach.progress = progress;
                changed = true;
            }
            if (progress >= ach.target && !ach.unlockedAt) {
                ach.unlockedAt = Date.now();
                changed = true;
            }
        }

        if (changed) {
            setAchievements(updated);
            await saveAchievements(uid, updated);
        }
    }, [achievements, settings, uid]);

    const addCigarette = useCallback(async () => {
        if (!uid) return;
        const newLog = await addLogFirestore(uid);
        const updatedLogs = [...logs, newLog];
        setLogs(updatedLogs);
        await checkAchievements(updatedLogs, crisisCountRef.current);
    }, [uid, logs, checkAchievements]);

    const undoLastCigarette = useCallback(async () => {
        if (!uid || logs.length === 0) return;
        await removeLastLog(uid, logs);
        setLogs(logs.slice(0, -1));
    }, [uid, logs]);

    const updateSettings = useCallback(async (partial: Partial<UserSettings>) => {
        if (!uid) return;
        const updated = { ...settings, ...partial };
        setSettings(updated);
        await saveSettings(uid, updated);
    }, [uid, settings]);

    const completeCrisis = useCallback(async () => {
        crisisCountRef.current += 1;
        await checkAchievements(logs, crisisCountRef.current);
    }, [logs, checkAchievements]);

    const sendAdminNotification = useCallback(async (title: string, body: string) => {
        const notif: AdminNotification = {
            id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
            title,
            body,
            sentAt: Date.now(),
        };
        // Save to Firestore
        await saveAdminNotification(notif);
        // Send real push notification to all users
        const result = await sendPushToAllUsers(title, body);
        console.log(`Push sent: ${result.success} success, ${result.failed} failed`);
        setNotifications(prev => [notif, ...prev]);
    }, []);

    const refreshData = useCallback(async () => {
        if (!uid) return;
        const [l, s, a, n] = await Promise.all([
            getLogs(uid),
            getSettings(uid),
            getAchievements(uid),
            getAdminNotifications(),
        ]);
        setLogs(l);
        setSettings(s);
        setAchievements(a);
        setNotifications(n);
    }, [uid]);

    return (
        <SmokingContext.Provider value={{
            logs, settings, achievements, notifications,
            todayCount, lastSmoke, isLoading, uid,
            addCigarette, undoLastCigarette, updateSettings,
            completeCrisis, sendAdminNotification, refreshData,
            getTodayLogs, getWeekData, getDailyAverage, getTotalSaved,
        }}>
            {children}
        </SmokingContext.Provider>
    );
}
