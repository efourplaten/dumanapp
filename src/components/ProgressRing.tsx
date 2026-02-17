import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors, FontSize } from '../theme';

interface ProgressRingProps {
    progress: number; // 0 to 1
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
    label?: string;
    sublabel?: string;
}

export function ProgressRing({
    progress,
    size = 120,
    strokeWidth = 10,
    color = Colors.accent,
    bgColor = Colors.border,
    label,
    sublabel,
}: ProgressRingProps) {
    const animValue = useRef(new Animated.Value(0)).current;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    useEffect(() => {
        Animated.spring(animValue, {
            toValue: clampedProgress,
            useNativeDriver: false,
            tension: 40,
            friction: 8,
        }).start();
    }, [clampedProgress]);

    // We'll use a simple bar-based approach for cross-platform
    const innerSize = size - strokeWidth * 2;

    // Create segments for progress visualization
    const segments = 36;
    const activeSegments = Math.round(clampedProgress * segments);
    const overLimit = clampedProgress > 1;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            {/* Background circle made of segments */}
            <View style={[styles.ringContainer, { width: size, height: size }]}>
                {Array.from({ length: segments }).map((_, i) => {
                    const angle = (i / segments) * 360 - 90;
                    const rad = (angle * Math.PI) / 180;
                    const radius = (size - strokeWidth) / 2;
                    const x = size / 2 + Math.cos(rad) * radius - strokeWidth / 2;
                    const y = size / 2 + Math.sin(rad) * radius - strokeWidth / 2;
                    const isActive = i < activeSegments;

                    return (
                        <View
                            key={i}
                            style={[
                                styles.segment,
                                {
                                    left: x,
                                    top: y,
                                    width: strokeWidth,
                                    height: strokeWidth,
                                    borderRadius: strokeWidth / 2,
                                    backgroundColor: isActive
                                        ? (overLimit ? Colors.danger : color)
                                        : bgColor,
                                    opacity: isActive ? 1 : 0.3,
                                },
                            ]}
                        />
                    );
                })}
            </View>
            {/* Center content */}
            <View style={[styles.center, { width: innerSize, height: innerSize }]}>
                {label && <Text style={styles.label}>{label}</Text>}
                {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringContainer: {
        position: 'absolute',
    },
    segment: {
        position: 'absolute',
    },
    center: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        color: Colors.textPrimary,
        fontSize: FontSize.xxxl,
        fontWeight: '700',
    },
    sublabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        marginTop: 2,
    },
});
