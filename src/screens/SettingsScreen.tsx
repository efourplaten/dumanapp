import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Alert,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../theme';
import { useSmokingContext } from '../context/SmokingContext';
import { GradientCard } from '../components/GradientCard';
import { clearAllData } from '../utils/storage';
import { registerForPushNotifications } from '../utils/notifications';

const ADMIN_UID = process.env.EXPO_PUBLIC_ADMIN_UID || '';

export function SettingsScreen() {
    const { settings, updateSettings, notifications, sendAdminNotification, refreshData, uid } = useSmokingContext();
    const [packPrice, setPackPrice] = useState(settings.packPrice.toString());
    const [perPack, setPerPack] = useState(settings.cigarettesPerPack.toString());
    const [dailyLimit, setDailyLimit] = useState(settings.dailyLimit.toString());

    // Admin notification state
    const [notifTitle, setNotifTitle] = useState('');
    const [notifBody, setNotifBody] = useState('');
    const [pushToken, setPushToken] = useState<string | null>(null);

    const isAdmin = uid === ADMIN_UID;

    // Show push token for admin debugging
    useEffect(() => {
        if (isAdmin && uid) {
            registerForPushNotifications(uid).then(t => setPushToken(t));
        }
    }, [isAdmin, uid]);

    const handleSave = async () => {
        const pp = parseFloat(packPrice);
        const cp = parseInt(perPack);
        const dl = parseInt(dailyLimit);
        if (isNaN(pp) || isNaN(cp) || isNaN(dl)) {
            Alert.alert('Hata', 'Geçerli değerler girin.');
            return;
        }
        await updateSettings({
            packPrice: pp,
            cigarettesPerPack: cp,
            dailyLimit: dl,
        });
        Alert.alert('✅ Kaydedildi', 'Ayarlar güncellendi.');
    };

    const handleReset = () => {
        Alert.alert(
            '⚠️ Verileri Sıfırla',
            'Tüm veriler silinecek. Bu işlem geri alınamaz!',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sıfırla',
                    style: 'destructive',
                    onPress: async () => {
                        if (uid) await clearAllData(uid);
                        await refreshData();
                        Alert.alert('✅ Sıfırlandı', 'Tüm veriler temizlendi.');
                    },
                },
            ]
        );
    };

    const handleSendNotification = async () => {
        if (!notifTitle.trim() || !notifBody.trim()) {
            Alert.alert('Hata', 'Başlık ve mesaj girmelisiniz.');
            return;
        }
        await sendAdminNotification(notifTitle.trim(), notifBody.trim());
        setNotifTitle('');
        setNotifBody('');
        Alert.alert('✅ Gönderildi', 'Bildirim başarıyla gönderildi.');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>⚙️ Ayarlar</Text>
                <Text style={styles.subtitle}>Uygulama tercihlerini yönet</Text>
            </View>

            {/* Pack Settings */}
            <Text style={styles.sectionTitle}>📦 Paket Ayarları</Text>
            <GradientCard>
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Paket Fiyatı (₺)</Text>
                    <TextInput
                        style={styles.input}
                        value={packPrice}
                        onChangeText={setPackPrice}
                        keyboardType="decimal-pad"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Sigara / Paket</Text>
                    <TextInput
                        style={styles.input}
                        value={perPack}
                        onChangeText={setPerPack}
                        keyboardType="number-pad"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>
                <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Günlük Limit</Text>
                    <TextInput
                        style={styles.input}
                        value={dailyLimit}
                        onChangeText={setDailyLimit}
                        keyboardType="number-pad"
                        placeholderTextColor={Colors.textMuted}
                    />
                </View>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
                    <Text style={styles.saveBtnText}>💾 Kaydet</Text>
                </TouchableOpacity>
            </GradientCard>

            {/* Admin Notification - only visible to admin */}
            {isAdmin && (
                <>
                    <Text style={styles.sectionTitle}>📢 Admin Bildirim Gönder</Text>
                    <GradientCard variant="accent">
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Başlık</Text>
                            <TextInput
                                style={styles.input}
                                value={notifTitle}
                                onChangeText={setNotifTitle}
                                placeholder="Bildirim başlığı..."
                                placeholderTextColor={Colors.textMuted}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Mesaj</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={notifBody}
                                onChangeText={setNotifBody}
                                placeholder="Motivasyon mesajı yazın..."
                                placeholderTextColor={Colors.textMuted}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                        <TouchableOpacity style={styles.sendBtn} onPress={handleSendNotification} activeOpacity={0.8}>
                            <Text style={styles.sendBtnText}>📤 Bildirim Gönder</Text>
                        </TouchableOpacity>
                    </GradientCard>
                </>
            )}

            {/* Notification History - only visible to admin */}
            {isAdmin && notifications.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>📋 Bildirim Geçmişi</Text>
                    {notifications.slice(0, 10).map(n => (
                        <View key={n.id} style={styles.notifItem}>
                            <View style={styles.notifHeader}>
                                <Text style={styles.notifTitle}>{n.title}</Text>
                                <Text style={styles.notifTime}>
                                    {new Date(n.sentAt).toLocaleDateString('tr-TR')}
                                </Text>
                            </View>
                            <Text style={styles.notifBody}>{n.body}</Text>
                        </View>
                    ))}
                </>
            )}

            {/* App Info */}
            <Text style={styles.sectionTitle}>ℹ️ Uygulama</Text>
            <GradientCard>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Versiyon</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Geliştirici</Text>
                    <Text style={styles.infoValue}>DumanApp Team</Text>
                </View>
                {isAdmin && (
                    <>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>UID</Text>
                            <Text style={[styles.infoValue, { fontSize: 10 }]} selectable>{uid}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Push Token</Text>
                            <Text style={[styles.infoValue, { fontSize: 10, flex: 1, textAlign: 'right' }]} selectable>{pushToken ?? 'Alınamadı'}</Text>
                        </View>
                    </>
                )}
            </GradientCard>

            {/* Reset */}
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
                <Text style={styles.resetBtnText}>🗑️ Tüm Verileri Sıfırla</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
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
        marginTop: Spacing.xxl,
        marginBottom: Spacing.md,
    },
    field: {
        marginBottom: Spacing.md,
    },
    fieldLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        backgroundColor: Colors.backgroundLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        color: Colors.textPrimary,
        fontSize: FontSize.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textArea: {
        minHeight: 80,
        paddingTop: Spacing.md,
    },
    saveBtn: {
        backgroundColor: Colors.accent,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    saveBtnText: {
        color: Colors.background,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    sendBtn: {
        backgroundColor: Colors.accentDark,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    sendBtnText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
    notifItem: {
        backgroundColor: Colors.card,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notifTitle: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    notifTime: {
        color: Colors.textMuted,
        fontSize: FontSize.xs,
    },
    notifBody: {
        color: Colors.textSecondary,
        fontSize: FontSize.sm,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    infoLabel: {
        color: Colors.textSecondary,
        fontSize: FontSize.md,
    },
    infoValue: {
        color: Colors.textPrimary,
        fontSize: FontSize.md,
        fontWeight: '600',
    },
    resetBtn: {
        marginTop: Spacing.xxl,
        backgroundColor: Colors.danger,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        opacity: 0.8,
    },
    resetBtnText: {
        color: Colors.white,
        fontSize: FontSize.lg,
        fontWeight: '700',
    },
});
