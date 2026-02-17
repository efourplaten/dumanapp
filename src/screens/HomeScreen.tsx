import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, Dimensions,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../theme';
import { useSmokingContext } from '../context/SmokingContext';
import { GradientCard } from '../components/GradientCard';
import { StatCard } from '../components/StatCard';
import { ProgressRing } from '../components/ProgressRing';
import { WeeklyChart } from '../components/WeeklyChart';

function formatDuration(ms: number): string {
    if (ms <= 0) return '0sn';
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const d = Math.floor(hr / 24);
    if (d > 0) return `${d}g ${hr % 24}sa`;
    if (hr > 0) return `${hr}sa ${min % 60}dk`;
    if (min > 0) return `${min}dk ${sec % 60}sn`;
    return `${sec}sn`;
}

export function HomeScreen() {
    const {
        todayCount, lastSmoke, settings, addCigarette,
        undoLastCigarette, getWeekData, getDailyAverage,
    } = useSmokingContext();

    const [timeSince, setTimeSince] = useState('');
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const addScale = useRef(new Animated.Value(1)).current;
    const [showUndo, setShowUndo] = useState(false);

    // Timer update
    useEffect(() => {
        const update = () => {
            if (lastSmoke) {
                setTimeSince(formatDuration(Date.now() - lastSmoke));
            } else {
                setTimeSince('Henüz yok');
            }
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [lastSmoke]);

    // Pulse animation for progress ring
    useEffect(() => {
        if (todayCount >= settings.dailyLimit) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();
        }
    }, [todayCount, settings.dailyLimit]);

    const handleAdd = useCallback(async () => {
        // Button press animation
        Animated.sequence([
            Animated.timing(addScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
            Animated.spring(addScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }),
        ]).start();

        await addCigarette();
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 5000);
    }, [addCigarette]);

    const progress = settings.dailyLimit > 0 ? todayCount / settings.dailyLimit : 0;
    const isOverLimit = todayCount > settings.dailyLimit;
    const weekData = getWeekData();
    const avgDaily = getDailyAverage();
    const remaining = Math.max(0, settings.dailyLimit - todayCount);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.greeting}>🚬 Duman</Text>
                <Text style={styles.subtitle}>Bugün nasıl gidiyor?</Text>
            </View>

            {/* Main Progress Card */}
            <GradientCard variant={isOverLimit ? 'danger' : 'accent'} style={styles.mainCard}>
                <View style={styles.progressSection}>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <ProgressRing
                            progress={progress}
                            size={140}
                            strokeWidth={8}
                            label={`${todayCount}`}
                            sublabel={`/ ${settings.dailyLimit} limit`}
                            color={isOverLimit ? Colors.danger : Colors.accent}
                        />
                    </Animated.View>
                    <View style={styles.progressInfo}>
                        {isOverLimit ? (
                            <View style={styles.warningBox}>
                                <Text style={styles.warningIcon}>⚠️</Text>
                                <Text style={styles.warningText}>Limit aşıldı!</Text>
                                <Text style={styles.warningSubtext}>
                                    {todayCount - settings.dailyLimit} fazla
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.remainingBox}>
                                <Text style={styles.remainingNumber}>{remaining}</Text>
                                <Text style={styles.remainingText}>kaldı</Text>
                            </View>
                        )}
                    </View>
                </View>
            </GradientCard>

            {/* Add Button */}
            <Animated.View style={{ transform: [{ scale: addScale }] }}>
                <TouchableOpacity
                    style={[styles.addButton, isOverLimit && styles.addButtonDanger]}
                    onPress={handleAdd}
                    activeOpacity={0.8}
                >
                    <Text style={styles.addButtonIcon}>🚬</Text>
                    <Text style={styles.addButtonText}>+1 Sigara</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Undo */}
            {showUndo && (
                <TouchableOpacity style={styles.undoButton} onPress={() => { undoLastCigarette(); setShowUndo(false); }}>
                    <Text style={styles.undoText}>↩️ Geri Al</Text>
                </TouchableOpacity>
            )}

            {/* Timer Card */}
            <GradientCard style={styles.timerCard}>
                <Text style={styles.timerLabel}>⏱️ Son sigaradan bu yana</Text>
                <Text style={styles.timerValue}>{timeSince}</Text>
            </GradientCard>

            {/* Quick Stats */}
            <View style={styles.statsRow}>
                <StatCard icon="📊" title="Günlük Ort." value={`${avgDaily}`} />
                <StatCard icon="🎯" title="Bugünkü Limit" value={`${settings.dailyLimit}`} />
                <StatCard
                    icon="📦"
                    title="Paket Fiyatı"
                    value={`${settings.packPrice}₺`}
                />
            </View>

            {/* Weekly Chart */}
            <GradientCard style={styles.chartCard}>
                <Text style={styles.chartTitle}>📅 Haftalık Görünüm</Text>
                <WeeklyChart data={weekData} limit={settings.dailyLimit} />
            </GradientCard>

            <View style={{ height: 30 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    greeting: {
        fontSize: FontSize.xxxl,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    mainCard: {
        marginBottom: Spacing.lg,
    },
    progressSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressInfo: {
        flex: 1,
        marginLeft: Spacing.xl,
        alignItems: 'center',
    },
    warningBox: {
        alignItems: 'center',
    },
    warningIcon: {
        fontSize: 32,
    },
    warningText: {
        color: Colors.danger,
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginTop: 4,
    },
    warningSubtext: {
        color: Colors.dangerLight,
        fontSize: FontSize.md,
        marginTop: 2,
    },
    remainingBox: {
        alignItems: 'center',
    },
    remainingNumber: {
        fontSize: FontSize.giant,
        fontWeight: '800',
        color: Colors.accent,
    },
    remainingText: {
        color: Colors.textSecondary,
        fontSize: FontSize.lg,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.xl,
        paddingVertical: Spacing.lg,
        marginBottom: Spacing.sm,
        ...Shadow.glow(Colors.accent),
    },
    addButtonDanger: {
        backgroundColor: Colors.danger,
        ...Shadow.glow(Colors.danger),
    },
    addButtonIcon: {
        fontSize: 24,
        marginRight: Spacing.sm,
    },
    addButtonText: {
        color: Colors.background,
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    undoButton: {
        alignSelf: 'center',
        padding: Spacing.sm,
        marginBottom: Spacing.md,
    },
    undoText: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    timerCard: {
        marginBottom: Spacing.lg,
        alignItems: 'center',
    },
    timerLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        marginBottom: 6,
    },
    timerValue: {
        color: Colors.accent,
        fontSize: FontSize.xxxl,
        fontWeight: '700',
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    chartCard: {
        marginBottom: Spacing.md,
    },
    chartTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
});
