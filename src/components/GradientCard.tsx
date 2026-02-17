import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadow, Spacing } from '../theme';

interface GradientCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'accent' | 'danger' | 'success';
}

const variantColors = {
    default: { bg: Colors.card, border: Colors.border },
    accent: { bg: '#0D2E2A', border: Colors.accent },
    danger: { bg: '#2E1A1A', border: Colors.danger },
    success: { bg: '#1A2E2A', border: Colors.success },
};

export function GradientCard({ children, style, variant = 'default' }: GradientCardProps) {
    const c = variantColors[variant];
    return (
        <View style={[styles.card, { backgroundColor: c.bg, borderColor: c.border }, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        ...Shadow.card,
    },
});
