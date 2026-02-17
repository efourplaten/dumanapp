import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, Easing, Modal,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius, Shadow } from '../theme';
import { useSmokingContext } from '../context/SmokingContext';
import { GradientCard } from '../components/GradientCard';

const MOTIVATIONAL_MESSAGES = [
    '💪 Yapabilirsin! Bu sadece birkaç dakika sürecek.',
    '🌟 Her geçen saniye güçleniyorsun.',
    '🧘 Derin bir nefes al, rahatla...',
    '📈 Bu anı atlattığında bir adım daha yakınsın!',
    '🏆 Geçmişte de başardın, şimdi de yapabilirsin.',
    '🌈 Her kriz atlatıldığında daha güçlü olursun.',
    '💎 Bedenin sana teşekkür edecek.',
    '🌱 Küçük adımlar büyük değişimler yaratır.',
    '⭐ Bugün kendine verdiğin en güzel hediye.',
    '🎯 Odaklan, konsantre ol, geçecek.',
    '🔥 İçindeki güç senden büyük!',
    '🎉 Her "hayır" dediğinde kutla!',
];

type CrisisMode = 'menu' | 'breathing' | 'game' | 'done';

export function CrisisScreen() {
    const { completeCrisis } = useSmokingContext();
    const [mode, setMode] = useState<CrisisMode>('menu');
    const [message, setMessage] = useState('');

    const pickMessage = () => {
        const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
        setMessage(msg);
    };

    useEffect(() => { pickMessage(); }, []);

    const handleComplete = useCallback(async () => {
        await completeCrisis();
        setMode('done');
        pickMessage();
    }, [completeCrisis]);

    const reset = () => {
        setMode('menu');
        pickMessage();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>🔥 Kriz Modu</Text>
                <Text style={styles.subtitle}>İçme isteğini yenmeni sağlayacak</Text>
            </View>

            {mode === 'menu' && <MenuView message={message} setMode={setMode} pickMessage={pickMessage} />}
            {mode === 'breathing' && <BreathingView onComplete={handleComplete} onBack={reset} />}
            {mode === 'game' && <TapGameView onComplete={handleComplete} onBack={reset} />}
            {mode === 'done' && <DoneView message={message} onReset={reset} />}
        </ScrollView>
    );
}

function MenuView({
    message, setMode, pickMessage,
}: {
    message: string;
    setMode: (m: CrisisMode) => void;
    pickMessage: () => void;
}) {
    return (
        <View>
            {/* Motivational Message */}
            <GradientCard variant="accent" style={styles.messageCard}>
                <Text style={styles.messageEmoji}>💬</Text>
                <Text style={styles.messageText}>{message}</Text>
                <TouchableOpacity onPress={pickMessage} style={styles.refreshBtn}>
                    <Text style={styles.refreshText}>🔄 Yeni mesaj</Text>
                </TouchableOpacity>
            </GradientCard>

            {/* Options */}
            <Text style={styles.sectionTitle}>Ne yapmak istersin?</Text>

            <TouchableOpacity style={styles.optionCard} onPress={() => setMode('breathing')} activeOpacity={0.8}>
                <View style={[styles.optionIcon, { backgroundColor: '#1A3A3A' }]}>
                    <Text style={styles.optionEmoji}>🧘</Text>
                </View>
                <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>Nefes Egzersizi</Text>
                    <Text style={styles.optionDesc}>2 dakikalık rahatlatıcı nefes tekniği</Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionCard} onPress={() => setMode('game')} activeOpacity={0.8}>
                <View style={[styles.optionIcon, { backgroundColor: '#3A2A1A' }]}>
                    <Text style={styles.optionEmoji}>🎮</Text>
                </View>
                <View style={styles.optionInfo}>
                    <Text style={styles.optionTitle}>Mini Oyun</Text>
                    <Text style={styles.optionDesc}>30 saniyelik tap challenge</Text>
                </View>
                <Text style={styles.optionArrow}>→</Text>
            </TouchableOpacity>

            <GradientCard style={styles.tipCard}>
                <Text style={styles.tipTitle}>💡 Bilgi</Text>
                <Text style={styles.tipText}>
                    Sigara isteği genelde 3-5 dakika sürer. Bu aktiviteler süreyi atlatmanı sağlar. Dayanabilirsin!
                </Text>
            </GradientCard>
        </View>
    );
}

function BreathingView({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
    const breathAnim = useRef(new Animated.Value(0.4)).current;
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [seconds, setSeconds] = useState(120);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (!isActive) return;

        const breathSequence = () => {
            // Inhale 4s
            setPhase('inhale');
            Animated.timing(breathAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }).start(() => {
                if (!isActive) return;
                // Hold 4s
                setPhase('hold');
                setTimeout(() => {
                    if (!isActive) return;
                    // Exhale 4s
                    setPhase('exhale');
                    Animated.timing(breathAnim, {
                        toValue: 0.4,
                        duration: 4000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }).start(() => {
                        if (isActive) breathSequence();
                    });
                }, 4000);
            });
        };

        breathSequence();
        return () => setIsActive(false);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setSeconds(s => {
                if (s <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const phaseText = phase === 'inhale' ? 'Nefes Al' : phase === 'hold' ? 'Tut' : 'Nefes Ver';
    const phaseColor = phase === 'inhale' ? Colors.accent : phase === 'hold' ? Colors.warning : Colors.success;

    return (
        <View style={styles.activityContainer}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>

            <Text style={styles.activityTitle}>🧘 Nefes Egzersizi</Text>
            <Text style={styles.timerText}>{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}</Text>

            <Animated.View
                style={[
                    styles.breathCircle,
                    {
                        transform: [{ scale: breathAnim }],
                        backgroundColor: phaseColor,
                    },
                ]}
            >
                <Text style={styles.breathText}>{phaseText}</Text>
            </Animated.View>

            <Text style={styles.breathHint}>
                4 sn nefes al → 4 sn tut → 4 sn nefes ver
            </Text>
        </View>
    );
}

function TapGameView({ onComplete, onBack }: { onComplete: () => void; onBack: () => void }) {
    const [taps, setTaps] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameEnded, setGameEnded] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!gameStarted || gameEnded) return;
        const timer = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timer);
                    setGameEnded(true);
                    onComplete();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameStarted, gameEnded]);

    const handleTap = () => {
        if (!gameStarted) setGameStarted(true);
        if (gameEnded) return;
        setTaps(t => t + 1);
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.92, duration: 50, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 300, friction: 8 }),
        ]).start();
    };

    return (
        <View style={styles.activityContainer}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>

            <Text style={styles.activityTitle}>🎮 Tap Challenge</Text>

            {!gameStarted && (
                <Text style={styles.gameHint}>Başlamak için butona dokun!</Text>
            )}

            <View style={styles.gameStats}>
                <View style={styles.gameStat}>
                    <Text style={styles.gameStatValue}>{taps}</Text>
                    <Text style={styles.gameStatLabel}>TAP</Text>
                </View>
                <View style={styles.gameStat}>
                    <Text style={[styles.gameStatValue, timeLeft <= 5 && { color: Colors.danger }]}>{timeLeft}s</Text>
                    <Text style={styles.gameStatLabel}>SÜRE</Text>
                </View>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity
                    style={[styles.tapButton, gameEnded && styles.tapButtonDone]}
                    onPress={handleTap}
                    activeOpacity={0.7}
                    disabled={gameEnded}
                >
                    <Text style={styles.tapEmoji}>{gameEnded ? '🎉' : '👆'}</Text>
                    <Text style={styles.tapText}>
                        {gameEnded ? 'Tebrikler!' : 'DOKUN!'}
                    </Text>
                </TouchableOpacity>
            </Animated.View>

            {gameEnded && (
                <Text style={styles.gameResult}>
                    🏆 30 saniyede {taps} kez dokundun!
                </Text>
            )}
        </View>
    );
}

function DoneView({ message, onReset }: { message: string; onReset: () => void }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={[styles.doneContainer, { opacity: fadeAnim }]}>
            <Text style={styles.doneEmoji}>🎊</Text>
            <Text style={styles.doneTitle}>Harikasın!</Text>
            <Text style={styles.doneText}>Bu krizi başarıyla atlattın.</Text>
            <Text style={styles.doneMessage}>{message}</Text>
            <TouchableOpacity style={styles.doneButton} onPress={onReset} activeOpacity={0.8}>
                <Text style={styles.doneButtonText}>Tamam</Text>
            </TouchableOpacity>
        </Animated.View>
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
    messageCard: {
        alignItems: 'center',
    },
    messageEmoji: {
        fontSize: 36,
        marginBottom: Spacing.sm,
    },
    messageText: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 28,
    },
    refreshBtn: {
        marginTop: Spacing.md,
        padding: Spacing.sm,
    },
    refreshText: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    optionIcon: {
        width: 50,
        height: 50,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    optionEmoji: {
        fontSize: 28,
    },
    optionInfo: {
        flex: 1,
    },
    optionTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
    optionDesc: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        marginTop: 2,
    },
    optionArrow: {
        color: Colors.textMuted,
        fontSize: FontSize.xl,
    },
    tipCard: {
        marginTop: Spacing.lg,
    },
    tipTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    tipText: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
        lineHeight: 22,
    },
    activityContainer: {
        alignItems: 'center',
        paddingTop: Spacing.xl,
    },
    backBtn: {
        alignSelf: 'flex-start',
        padding: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    backText: {
        color: Colors.accent,
        fontSize: FontSize.lg,
        fontWeight: '600',
    },
    activityTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '700',
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    timerText: {
        fontSize: FontSize.huge,
        fontWeight: '300',
        color: Colors.textSecondary,
        marginBottom: Spacing.xxl,
    },
    breathCircle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.xxl,
    },
    breathText: {
        color: Colors.background,
        fontSize: FontSize.xxl,
        fontWeight: '700',
    },
    breathHint: {
        color: Colors.textMuted,
        fontSize: FontSize.md,
        textAlign: 'center',
        marginTop: Spacing.lg,
    },
    gameHint: {
        color: Colors.textSecondary,
        fontSize: FontSize.lg,
        marginBottom: Spacing.xl,
    },
    gameStats: {
        flexDirection: 'row',
        gap: Spacing.huge,
        marginBottom: Spacing.xxl,
    },
    gameStat: {
        alignItems: 'center',
    },
    gameStatValue: {
        color: Colors.accent,
        fontSize: FontSize.giant,
        fontWeight: '800',
    },
    gameStatLabel: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        fontWeight: '600',
    },
    tapButton: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.glow(Colors.accent),
    },
    tapButtonDone: {
        backgroundColor: Colors.success,
        ...Shadow.glow(Colors.success),
    },
    tapEmoji: {
        fontSize: 48,
    },
    tapText: {
        color: Colors.background,
        fontSize: FontSize.xl,
        fontWeight: '700',
        marginTop: 4,
    },
    gameResult: {
        color: Colors.accentLight,
        fontSize: FontSize.lg,
        fontWeight: '600',
        marginTop: Spacing.xxl,
        textAlign: 'center',
    },
    doneContainer: {
        alignItems: 'center',
        paddingTop: Spacing.huge,
    },
    doneEmoji: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    doneTitle: {
        color: Colors.accent,
        fontSize: FontSize.huge,
        fontWeight: '800',
        marginBottom: Spacing.sm,
    },
    doneText: {
        color: Colors.textPrimary,
        fontSize: FontSize.xl,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    doneMessage: {
        color: Colors.textSecondary,
        fontSize: FontSize.lg,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: Spacing.xxl,
        paddingHorizontal: Spacing.xl,
    },
    doneButton: {
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.xxxl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.xl,
    },
    doneButtonText: {
        color: Colors.background,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
});
