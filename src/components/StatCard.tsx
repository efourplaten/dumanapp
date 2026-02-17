import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../theme';

interface StatCardProps {
    icon: string;
    title: string;
    value: string;
    subtitle?: string;
    accentColor?: string;
}

export function StatCard({ icon, title, value, subtitle, accentColor = Colors.accent }: StatCardProps) {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: 16,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        minHeight: 110,
        justifyContent: 'center',
    },
    icon: {
        fontSize: 24,
        marginBottom: 4,
    },
    title: {
        color: Colors.textSecondary,
        fontSize: FontSize.xs,
        marginBottom: 4,
        textAlign: 'center',
    },
    value: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    subtitle: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
        marginTop: 2,
        textAlign: 'center',
    },
});
