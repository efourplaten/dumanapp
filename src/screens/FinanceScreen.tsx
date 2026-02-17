import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme';
import { useSmokingContext } from '../context/SmokingContext';
import { GradientCard } from '../components/GradientCard';
import { StatCard } from '../components/StatCard';

export function FinanceScreen() {
    const { settings, todayCount, logs, getDailyAverage, getTotalSaved } = useSmokingContext();

    const pricePerCig = settings.packPrice / settings.cigarettesPerPack;
    const avgDaily = getDailyAverage();
    const todayCost = Math.round(todayCount * pricePerCig * 100) / 100;
    const dailyAvgCost = Math.round(avgDaily * pricePerCig * 100) / 100;
    const weeklyCost = Math.round(dailyAvgCost * 7 * 100) / 100;
    const monthlyCost = Math.round(dailyAvgCost * 30 * 100) / 100;
    const yearlyCost = Math.round(dailyAvgCost * 365 * 100) / 100;
    const totalSaved = getTotalSaved();

    const potentialDailySaving = Math.round((settings.dailyLimit - Math.min(avgDaily, settings.dailyLimit)) * pricePerCig * 100) / 100;
    const potentialYearlySaving = Math.round(potentialDailySaving * 365 * 100) / 100;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>💰 Finans Takibi</Text>
                <Text style={styles.subtitle}>Paranızın nereye gittiğini görün</Text>
            </View>

            {/* Savings Card */}
            <GradientCard variant="success" style={styles.savingsCard}>
                <Text style={styles.savingsIcon}>🎉</Text>
                <Text style={styles.savingsLabel}>Toplam Tasarruf</Text>
                <Text style={styles.savingsValue}>{totalSaved.toLocaleString('tr-TR')} ₺</Text>
                <Text style={styles.savingsHint}>Limit altında kalarak biriktirdiğin para</Text>
            </GradientCard>

            {/* Today's Cost */}
            <GradientCard variant={todayCost > settings.packPrice ? 'danger' : 'default'} style={styles.todayCard}>
                <View style={styles.todayRow}>
                    <View>
                        <Text style={styles.todayLabel}>Bugünkü Harcama</Text>
                        <Text style={styles.todayValue}>{todayCost.toFixed(2)} ₺</Text>
                    </View>
                    <View style={styles.todayInfo}>
                        <Text style={styles.todayInfoText}>{todayCount} sigara</Text>
                        <Text style={styles.todayInfoSub}>{pricePerCig.toFixed(2)} ₺/sigara</Text>
                    </View>
                </View>
            </GradientCard>

            {/* Cost Breakdown */}
            <Text style={styles.sectionTitle}>📊 Maliyet Analizi</Text>
            <View style={styles.statsGrid}>
                <StatCard icon="📅" title="Günlük Ort." value={`${dailyAvgCost.toFixed(0)}₺`} />
                <StatCard icon="📆" title="Haftalık" value={`${weeklyCost.toFixed(0)}₺`} />
            </View>
            <View style={styles.statsGrid}>
                <StatCard icon="🗓️" title="Aylık" value={`${monthlyCost.toFixed(0)}₺`} accentColor={Colors.warning} />
                <StatCard icon="📈" title="Yıllık" value={`${yearlyCost.toLocaleString('tr-TR')}₺`} accentColor={Colors.danger} />
            </View>

            {/* Potential Savings */}
            <Text style={styles.sectionTitle}>💎 Potansiyel Tasarruf</Text>
            <GradientCard variant="accent" style={styles.potentialCard}>
                <View style={styles.potentialRow}>
                    <View style={styles.potentialItem}>
                        <Text style={styles.potentialEmoji}>🌱</Text>
                        <Text style={styles.potentialValue}>{potentialDailySaving.toFixed(0)}₺</Text>
                        <Text style={styles.potentialLabel}>Günlük</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.potentialItem}>
                        <Text style={styles.potentialEmoji}>🌳</Text>
                        <Text style={styles.potentialValue}>{potentialYearlySaving.toLocaleString('tr-TR')}₺</Text>
                        <Text style={styles.potentialLabel}>Yıllık</Text>
                    </View>
                </View>
                <Text style={styles.potentialHint}>Azaltma hedefine ulaştığında tasarruf edeceğin tutar</Text>
            </GradientCard>

            {/* Pack Info */}
            <GradientCard style={styles.packCard}>
                <Text style={styles.packTitle}>📦 Paket Bilgisi</Text>
                <View style={styles.packRow}>
                    <View style={styles.packItem}>
                        <Text style={styles.packValue}>{settings.packPrice}₺</Text>
                        <Text style={styles.packLabel}>Paket Fiyatı</Text>
                    </View>
                    <View style={styles.packItem}>
                        <Text style={styles.packValue}>{settings.cigarettesPerPack}</Text>
                        <Text style={styles.packLabel}>Adet/Paket</Text>
                    </View>
                    <View style={styles.packItem}>
                        <Text style={styles.packValue}>{pricePerCig.toFixed(2)}₺</Text>
                        <Text style={styles.packLabel}>Birim Fiyat</Text>
                    </View>
                </View>
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
    savingsCard: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    savingsIcon: {
        fontSize: 40,
        marginBottom: Spacing.sm,
    },
    savingsLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        marginBottom: 4,
    },
    savingsValue: {
        color: Colors.success,
        fontSize: FontSize.huge,
        fontWeight: '800',
    },
    savingsHint: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    todayCard: {
        marginBottom: Spacing.md,
    },
    todayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    todayLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    todayValue: {
        color: Colors.textPrimary,
        fontSize: FontSize.xxl,
        fontWeight: '700',
        marginTop: 4,
    },
    todayInfo: {
        alignItems: 'flex-end',
    },
    todayInfoText: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
    todayInfoSub: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    potentialCard: {
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    potentialRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-evenly',
        marginBottom: Spacing.sm,
    },
    potentialItem: {
        alignItems: 'center',
        flex: 1,
    },
    potentialEmoji: {
        fontSize: 28,
        marginBottom: 4,
    },
    potentialValue: {
        color: Colors.accent,
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    potentialLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    divider: {
        width: 1,
        height: 50,
        backgroundColor: Colors.border,
    },
    potentialHint: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    packCard: {
        marginTop: Spacing.md,
    },
    packTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginBottom: Spacing.md,
    },
    packRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    packItem: {
        alignItems: 'center',
        flex: 1,
    },
    packValue: {
        color: Colors.accent,
        fontSize: FontSize.xl,
        fontWeight: '700',
    },
    packLabel: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginTop: 4,
    },
});
