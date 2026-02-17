import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    Animated, TextInput,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../theme';
import { useSmokingContext } from '../context/SmokingContext';
import { GradientCard } from '../components/GradientCard';

export function AchievementsScreen() {
    const { achievements, settings, updateSettings, todayCount } = useSmokingContext();
    const [editingLimit, setEditingLimit] = useState(false);
    const [newLimit, setNewLimit] = useState(settings.dailyLimit.toString());

    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    const progress = todayCount / Math.max(settings.dailyLimit, 1);
    const isOverLimit = todayCount > settings.dailyLimit;

    const handleSaveLimit = async () => {
        const val = parseInt(newLimit);
        if (!isNaN(val) && val > 0) {
            await updateSettings({ dailyLimit: val });
        }
        setEditingLimit(false);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>🏆 Başarılar</Text>
                <Text style={styles.subtitle}>Hedeflerini takip et, rozetleri kazan</Text>
            </View>

            {/* Daily Limit Section */}
            <GradientCard variant={isOverLimit ? 'danger' : 'accent'} style={styles.limitCard}>
                <View style={styles.limitHeader}>
                    <Text style={styles.limitTitle}>🎯 Günlük Limit</Text>
                    <TouchableOpacity
                        onPress={() => {
                            if (editingLimit) handleSaveLimit();
                            else { setNewLimit(settings.dailyLimit.toString()); setEditingLimit(true); }
                        }}
                    >
                        <Text style={styles.editBtn}>{editingLimit ? '✓ Kaydet' : '✏️ Düzenle'}</Text>
                    </TouchableOpacity>
                </View>

                {editingLimit ? (
                    <View style={styles.editRow}>
                        <TouchableOpacity
                            style={styles.limitAdjust}
                            onPress={() => setNewLimit(v => String(Math.max(1, parseInt(v) - 1)))}
                        >
                            <Text style={styles.limitAdjustText}>−</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.limitInput}
                            value={newLimit}
                            onChangeText={setNewLimit}
                            keyboardType="number-pad"
                            textAlign="center"
                        />
                        <TouchableOpacity
                            style={styles.limitAdjust}
                            onPress={() => setNewLimit(v => String(parseInt(v) + 1))}
                        >
                            <Text style={styles.limitAdjustText}>+</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.limitDisplay}>
                        <Text style={styles.limitCount}>{todayCount}</Text>
                        <Text style={styles.limitSep}>/</Text>
                        <Text style={styles.limitMax}>{settings.dailyLimit}</Text>
                    </View>
                )}

                {/* Progress Bar */}
                <View style={styles.progressBarBg}>
                    <View
                        style={[
                            styles.progressBarFill,
                            {
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor: isOverLimit ? Colors.danger : Colors.accent,
                            },
                        ]}
                    />
                </View>
                <Text style={styles.limitStatus}>
                    {isOverLimit
                        ? `⚠️ Limiti ${todayCount - settings.dailyLimit} adet aştın!`
                        : `✅ ${Math.max(0, settings.dailyLimit - todayCount)} adet kaldı`}
                </Text>
            </GradientCard>

            {/* Achievements Summary */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{unlockedCount}</Text>
                    <Text style={styles.summaryLabel}>Kazanılan</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{achievements.length - unlockedCount}</Text>
                    <Text style={styles.summaryLabel}>Kilitli</Text>
                </View>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{achievements.length}</Text>
                    <Text style={styles.summaryLabel}>Toplam</Text>
                </View>
            </View>

            {/* Achievement Grid */}
            <Text style={styles.sectionTitle}>🏅 Rozetler</Text>
            <View style={styles.badgeGrid}>
                {achievements.map(ach => {
                    const isUnlocked = ach.unlockedAt !== null;
                    const progressPct = Math.min(ach.progress / Math.max(ach.target, 1), 1);

                    return (
                        <View key={ach.id} style={[styles.badge, isUnlocked && styles.badgeUnlocked]}>
                            <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
                                {ach.icon}
                            </Text>
                            <Text style={[styles.badgeName, !isUnlocked && styles.badgeNameLocked]} numberOfLines={1}>
                                {ach.title}
                            </Text>
                            {isUnlocked ? (
                                <Text style={styles.badgeUnlockedText}>✅</Text>
                            ) : (
                                <View style={styles.badgeProgressBg}>
                                    <View
                                        style={[
                                            styles.badgeProgressFill,
                                            { width: `${progressPct * 100}%` },
                                        ]}
                                    />
                                </View>
                            )}
                            <Text style={styles.badgeProgress}>
                                {ach.progress}/{ach.target}
                            </Text>
                        </View>
                    );
                })}
            </View>

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
    title: {
        fontSize: FontSize.xxxl,
        fontWeight: '800',
        color: Colors.textPrimary,
    },
    subtitle: {
        fontSize: FontSize.lg,
        color: Colors.textSecondary,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: FontSize.xl,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    limitCard: {
        marginBottom: Spacing.lg,
    },
    limitHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    limitTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    editBtn: {
        color: Colors.accent,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    limitAdjust: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.backgroundLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    limitAdjustText: {
        color: Colors.textPrimary,
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    limitInput: {
        color: Colors.accent,
        fontSize: FontSize.huge,
        fontWeight: '800',
        marginHorizontal: Spacing.xl,
        width: 80,
    },
    limitDisplay: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    limitCount: {
        color: Colors.textPrimary,
        fontSize: FontSize.giant,
        fontWeight: '800',
    },
    limitSep: {
        color: Colors.textMuted,
        fontSize: FontSize.xxxl,
        marginHorizontal: Spacing.sm,
    },
    limitMax: {
        color: Colors.textSecondary,
        fontSize: FontSize.xxxl,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.backgroundLight,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    limitStatus: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        textAlign: 'center',
    },
    summaryRow: {
        flexDirection: 'row',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    summaryItem: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    summaryValue: {
        color: Colors.accent,
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    summaryLabel: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginTop: 2,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    badge: {
        width: '48%',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        opacity: 0.6,
    },
    badgeUnlocked: {
        opacity: 1,
        borderColor: Colors.accent,
        backgroundColor: '#0D2E2A',
    },
    badgeIcon: {
        fontSize: 32,
        marginBottom: 4,
    },
    badgeIconLocked: {
        opacity: 0.4,
    },
    badgeName: {
        color: Colors.textPrimary,
        fontSize: FontSize.sm,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
    },
    badgeNameLocked: {
        color: Colors.textMuted,
    },
    badgeUnlockedText: {
        fontSize: 16,
        marginBottom: 2,
    },
    badgeProgressBg: {
        width: '100%',
        height: 4,
        borderRadius: 2,
        backgroundColor: Colors.backgroundLight,
        overflow: 'hidden',
        marginBottom: 2,
    },
    badgeProgressFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: Colors.accent,
    },
    badgeProgress: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
    },
});
