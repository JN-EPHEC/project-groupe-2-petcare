import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Input, CustomPicker } from '../../components';
import {
  scheduleNotification,
  cancelNotification,
  type NotificationType,
} from '../../services/notificationService';
import type * as Notifications from 'expo-notifications';

interface EditNotificationScreenProps {
  navigation: any;
  route: any;
}

const NOTIFICATION_TYPES = [
  { label: 'Rappel', value: 'reminder' },
  { label: 'Rendez-vous', value: 'appointment' },
  { label: 'Vaccination', value: 'vaccination' },
  { label: 'Santé', value: 'health' },
  { label: 'Général', value: 'general' },
];

export const EditNotificationScreen: React.FC<EditNotificationScreenProps> = ({
  navigation,
  route,
}) => {
  const { notification } = route.params as { notification: Notifications.NotificationRequest };

  const [title, setTitle] = useState(notification.content.title || '');
  const [message, setMessage] = useState(notification.content.body || '');
  const [type, setType] = useState<NotificationType>(
    (notification.content.data?.type as NotificationType) || 'reminder'
  );

  // Extraire la date de la notification
  const getInitialDateTime = () => {
    if (notification.trigger && (notification.trigger as any).value) {
      return new Date((notification.trigger as any).value);
    }
    return new Date();
  };

  const initialDateTime = getInitialDateTime();
  const [date, setDate] = useState(initialDateTime);
  const [time, setTime] = useState(initialDateTime);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const combineDateTime = (): Date => {
    const combined = new Date(date);
    combined.setHours(time.getHours());
    combined.setMinutes(time.getMinutes());
    combined.setSeconds(0);
    combined.setMilliseconds(0);
    return combined;
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez entrer un titre');
      } else {
        Alert.alert('Erreur', 'Veuillez entrer un titre');
      }
      return false;
    }

    if (!message.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Veuillez entrer un message');
      } else {
        Alert.alert('Erreur', 'Veuillez entrer un message');
      }
      return false;
    }

    const scheduledDateTime = combineDateTime();
    if (scheduledDateTime <= new Date()) {
      if (Platform.OS === 'web') {
        window.alert('La date et l\'heure doivent être dans le futur');
      } else {
        Alert.alert('Erreur', 'La date et l\'heure doivent être dans le futur');
      }
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsUpdating(true);

      // Annuler l'ancienne notification
      await cancelNotification(notification.identifier);
      console.log('🗑️ Ancienne notification annulée');

      // Créer une nouvelle notification avec les nouvelles valeurs
      const scheduledDateTime = combineDateTime();
      console.log('📅 Nouvelle planification pour:', scheduledDateTime);

      const identifier = await scheduleNotification(
        title.trim(),
        message.trim(),
        notification.content.data || {},
        scheduledDateTime,
        type
      );

      if (identifier) {
        console.log('✅ Notification modifiée:', identifier);
        setIsSuccess(true);
        setIsUpdating(false);

        // Attendre 2 secondes puis revenir
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        throw new Error('Impossible de modifier la notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      setIsUpdating(false);
      if (Platform.OS === 'web') {
        window.alert('Impossible de modifier la notification');
      } else {
        Alert.alert('Erreur', 'Impossible de modifier la notification');
      }
    }
  };

  const getButtonStyle = () => {
    if (isSuccess) return [styles.updateButton, styles.updateButtonSuccess];
    if (isUpdating) return [styles.updateButton, styles.updateButtonDisabled];
    return styles.updateButton;
  };

  const getButtonContent = () => {
    if (isSuccess) {
      return (
        <>
          <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          <Text style={styles.updateButtonText}>Notification modifiée !</Text>
        </>
      );
    }
    if (isUpdating) {
      return (
        <>
          <ActivityIndicator size="small" color={colors.white} />
          <Text style={styles.updateButtonText}>Modification...</Text>
        </>
      );
    }
    return (
      <>
        <Ionicons name="save" size={24} color={colors.white} />
        <Text style={styles.updateButtonText}>Enregistrer les modifications</Text>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={colors.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier notification</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de notification</Text>
          <CustomPicker
            value={type}
            onValueChange={(value) => setType(value as NotificationType)}
            options={NOTIFICATION_TYPES}
            placeholder="Sélectionnez un type"
            icon="pricetag"
          />
        </View>

        {/* Contenu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contenu</Text>
          <Input
            label="Titre *"
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Rappel vaccination"
            maxLength={50}
          />
          <Input
            label="Message *"
            value={message}
            onChangeText={setMessage}
            placeholder="Ex: N'oubliez pas le vaccin de Max demain"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.helperText}>
            {title.length}/50 caractères • {message.length}/200 caractères
          </Text>
        </View>

        {/* Date et Heure */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planification</Text>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <input
                  type="date"
                  value={date.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      setDate(newDate);
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.navy,
                    outline: 'none',
                    padding: '8px 0',
                  }}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Heure */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Heure *</Text>
            {Platform.OS === 'web' ? (
              <View style={styles.dateInputContainer}>
                <Ionicons name="time" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <input
                  type="time"
                  value={`${time.getHours().toString().padStart(2, '0')}:${time
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':');
                    const newTime = new Date();
                    newTime.setHours(parseInt(hours, 10));
                    newTime.setMinutes(parseInt(minutes, 10));
                    setTime(newTime);
                  }}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.navy,
                    outline: 'none',
                    padding: '8px 0',
                  }}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.dateInputContainer}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color={colors.teal} style={{ marginRight: 8 }} />
                <Text style={styles.dateText}>
                  {time.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showTimePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={handleTimeChange}
            />
          )}

          {/* Aperçu */}
          <View style={styles.previewBox}>
            <Ionicons name="information-circle" size={20} color={colors.teal} />
            <Text style={styles.previewText}>
              La notification sera envoyée le{' '}
              {combineDateTime().toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              à{' '}
              {combineDateTime().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>

        {/* Bouton de modification */}
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={handleUpdate}
          disabled={isUpdating || isSuccess}
          activeOpacity={0.8}
        >
          {getButtonContent()}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'ios' ? spacing.xxl : spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
    marginBottom: spacing.sm,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  previewBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E0F7FA',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  previewText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.navy,
    lineHeight: 20,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  updateButtonDisabled: {
    backgroundColor: colors.gray,
  },
  updateButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  updateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});

