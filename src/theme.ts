export const Colors = {
    background: '#0F0F1A',
    backgroundLight: '#1A1A2E',
    card: '#1E1E32',
    cardLight: '#2A2A44',
    accent: '#00D9A6',
    accentDark: '#00B888',
    accentLight: '#33E3BD',
    danger: '#FF6B6B',
    dangerLight: '#FF8E8E',
    warning: '#FFB347',
    success: '#4ECDC4',
    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0B8',
    textMuted: '#6B6B80',
    border: '#2E2E48',
    overlay: 'rgba(0,0,0,0.5)',
    gradientStart: '#00D9A6',
    gradientEnd: '#00B4D8',
    white: '#FFFFFF',
    black: '#000000',
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

export const FontSize = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    xxxl: 28,
    huge: 36,
    giant: 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 999,
};

export const Shadow = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    glow: (color: string) => ({
        shadowColor: color,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    }),
};
