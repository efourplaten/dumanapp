import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme';

interface WeeklyChartProps {
    data: { day: string; count: number }[];
    limit?: number;
}

export function WeeklyChart({ data, limit }: WeeklyChartProps) {
    const maxCount = Math.max(...data.map(d => d.count), limit || 1, 1);

    return (
        <View style={styles.container}>
            <View style={styles.chartRow}>
                {data.map((item, i) => {
                    const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                    const isOverLimit = limit !== undefined && item.count > limit;
                    const isToday = i === data.length - 1;

                    return (
                        <View key={i} style={styles.barContainer}>
                            <Text style={[styles.countLabel, isOverLimit && { color: Colors.danger }]}>
                                {item.count}
                            </Text>
                            <View style={styles.barWrapper}>
                                {limit !== undefined && (
                                    <View
                                        style={[
                                            styles.limitLine,
                                            { bottom: `${(limit / maxCount) * 100}%` },
                                        ]}
                                    />
                                )}
                                <View
                                    style={[
                                        styles.bar,
                                        {
                                            height: `${Math.max(height, 4)}%`,
                                            backgroundColor: isOverLimit
                                                ? Colors.danger
                                                : isToday
                                                    ? Colors.accent
                                                    : Colors.accentDark,
                                            opacity: isToday ? 1 : 0.7,
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={[styles.dayLabel, isToday && styles.todayLabel]}>
                                {item.day}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Spacing.sm,
    },
    chartRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: 130,
    },
    barContainer: {
        flex: 1,
        alignItems: 'center',
        height: '100%',
        justifyContent: 'flex-end',
    },
    countLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        marginBottom: 4,
        fontWeight: '600',
    },
    barWrapper: {
        width: 20,
        height: 90,
        justifyContent: 'flex-end',
        borderRadius: BorderRadius.sm,
        overflow: 'hidden',
        backgroundColor: Colors.backgroundLight,
    },
    bar: {
        width: '100%',
        borderRadius: BorderRadius.sm,
        minHeight: 4,
    },
    limitLine: {
        position: 'absolute',
        left: -2,
        right: -2,
        height: 2,
        backgroundColor: Colors.warning,
        borderRadius: 1,
        zIndex: 1,
    },
    dayLabel: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginTop: 6,
    },
    todayLabel: {
        color: Colors.accent,
        fontWeight: '700',
    },
});
