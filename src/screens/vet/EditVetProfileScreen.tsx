import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, AddressAutocomplete } from '../../components';
import { updateUserProfile } from '../../services/firestoreService';

interface EditVetProfileScreenProps {
  navigation: any;
}

export const EditVetProfileScreen: React.FC<EditVetProfileScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  // États pour tous les champs du profil
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [experience, setExperience] = useState(user?.experience || '');
  const [clinicName, setClinicName] = useState(user?.clinicName || '');
  const [clinicAddress, setClinicAddress] = useState(user?.clinicAddress || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [consultationRate, setConsultationRate] = useState(user?.consultationRate || '');
  const [emergencyAvailable, setEmergencyAvailable] = useState(user?.emergencyAvailable ?? false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  const handleSave = async () => {
    console.log('🔹 handleSave appelé');
    
    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Erreur', 'Le prénom et le nom sont obligatoires');
      return;
    }

    if (!clinicName.trim() || !clinicAddress.trim() || !location.trim()) {
      Alert.alert('Erreur', 'Les informations de la clinique sont obligatoires');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Erreur', 'Le numéro de téléphone est obligatoire');
      return;
    }

    if (!user?.id) {
      Alert.alert('Erreur', 'Utilisateur non connecté');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔹 Début de la mise à jour...');

      // Préparer les données à mettre à jour
      const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        specialty: specialty.trim() || 'Vétérinaire généraliste',
        experience: experience.trim(),
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
        location: location.trim(),
        phone: phone.trim(),
        consultationRate: consultationRate.trim(),
        emergencyAvailable,
      };

      console.log('🔹 Données à mettre à jour:', updateData);
      await updateUserProfile(user.id, updateData);
      console.log('✅ Profil mis à jour avec succès!');

      Alert.alert(
        'Succès',
        'Votre profil a été mis à jour avec succès !',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('🔹 Navigation goBack');
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error updating profile:', error);
      Alert.alert('Erreur', error.message || 'Impossible de mettre à jour le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddressSelect = (address: string, city: string) => {
    setClinicAddress(address);
    setLocation(city);
    setShowAddressSearch(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={30} color={colors.navy} />
          </TouchableOpacity>
          <Text style={styles.title}>Modifier le profil</Text>
          <View style={{ width: 30 }} />
        </View>

        {/* Informations personnelles */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={24} color={colors.navy} />
            <Text style={styles.sectionTitle}>Informations personnelles</Text>
          </View>

          <Input
            label="Prénom *"
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            icon="person-outline"
          />

          <Input
            label="Nom *"
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
            icon="person-outline"
          />

          <Input
            label="Email"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            editable={false}
            style={styles.disabledInput}
          />
          <Text style={styles.helperText}>
            L'email ne peut pas être modifié
          </Text>
        </View>

        {/* Spécialité et Expérience */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical-outline" size={24} color={colors.navy} />
            <Text style={styles.sectionTitle}>Qualification</Text>
          </View>

          <Input
            label="Spécialité"
            placeholder="Ex: Vétérinaire généraliste, Chirurgien, etc."
            value={specialty}
            onChangeText={setSpecialty}
            icon="medical-outline"
          />

          <Input
            label="Années d'expérience"
            placeholder="Ex: 8 ans"
            value={experience}
            onChangeText={setExperience}
            icon="time-outline"
          />
        </View>

        {/* Informations de la clinique */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business-outline" size={24} color={colors.navy} />
            <Text style={styles.sectionTitle}>Clinique</Text>
          </View>

          <Input
            label="Nom de la clinique *"
            placeholder="Ex: Clinique Vétérinaire de Bruxelles"
            value={clinicName}
            onChangeText={setClinicName}
            icon="business-outline"
          />

          {Platform.OS === 'web' ? (
            // Sur web: saisie manuelle uniquement
            <Input
              label="Adresse complète *"
              placeholder="Ex: Rue de la Station 45, 1300 Wavre"
              value={clinicAddress}
              onChangeText={setClinicAddress}
              icon="location-outline"
              multiline
              helperText="Saisissez l'adresse complète de votre clinique"
            />
          ) : !showAddressSearch ? (
            <>
              <View style={styles.addressContainer}>
                <Input
                  label="Adresse complète *"
                  placeholder="Ex: Rue de la Station 45, 1300 Wavre"
                  value={clinicAddress}
                  onChangeText={setClinicAddress}
                  icon="location-outline"
                  multiline
                />
                <TouchableOpacity
                  style={styles.addressSearchButton}
                  onPress={() => setShowAddressSearch(true)}
                >
                  <Ionicons name="search" size={20} color={colors.white} />
                  <Text style={styles.addressSearchText}>Autocomplétion</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.autocompleteContainer}>
              <AddressAutocomplete
                label="Adresse complète *"
                placeholder="Rechercher une adresse..."
                defaultValue={clinicAddress}
                onAddressSelect={(address, city, details) => {
                  console.log('✅ Address autocomplete:', { address, city });
                  setClinicAddress(address);
                  setLocation(city);
                  setShowAddressSearch(false);
                }}
              />
              <TouchableOpacity
                style={styles.manualModeButton}
                onPress={() => setShowAddressSearch(false)}
              >
                <Ionicons name="create-outline" size={20} color={colors.navy} />
                <Text style={styles.manualModeText}>Saisir manuellement</Text>
              </TouchableOpacity>
            </View>
          )}

          <Input
            label="Ville *"
            placeholder="Ex: Bruxelles"
            value={location}
            onChangeText={setLocation}
            icon="location-outline"
          />
        </View>

        {/* Contact */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={24} color={colors.navy} />
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>

          <Input
            label="Téléphone *"
            placeholder="+32 475 12 34 56"
            value={phone}
            onChangeText={setPhone}
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <Text style={styles.helperText}>
            Format recommandé : +32 (indicatif pays) suivi du numéro
          </Text>
        </View>

        {/* Tarifs et Disponibilité */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cash-outline" size={24} color={colors.navy} />
            <Text style={styles.sectionTitle}>Tarifs et Disponibilité</Text>
          </View>

          <Input
            label="Tarif de consultation"
            placeholder="Ex: 50€"
            value={consultationRate}
            onChangeText={setConsultationRate}
            icon="cash-outline"
          />

          <TouchableOpacity
            style={styles.toggleContainer}
            onPress={() => setEmergencyAvailable(!emergencyAvailable)}
          >
            <View style={styles.toggleLeft}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.navy} />
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Urgences disponibles</Text>
                <Text style={styles.toggleSubtitle}>
                  Acceptez-vous les urgences ?
                </Text>
              </View>
            </View>
            <View style={[
              styles.toggle,
              emergencyAvailable && styles.toggleActive
            ]}>
              <View style={[
                styles.toggleThumb,
                emergencyAvailable && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bouton Enregistrer */}
        <View style={styles.buttonContainer}>
          <Button
            title={isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            onPress={handleSave}
            disabled={isLoading}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  disabledInput: {
    opacity: 0.6,
    backgroundColor: colors.lightGray,
  },
  helperText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
  addressContainer: {
    position: 'relative',
  },
  addressSearchButton: {
    position: 'absolute',
    right: 0,
    top: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.teal,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  addressSearchText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
  },
  autocompleteContainer: {
    marginBottom: spacing.md,
    zIndex: 1000,
  },
  manualModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  manualModeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.navy,
  },
  toggleSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray,
    marginTop: spacing.xs,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: colors.teal,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  saveButton: {
    marginBottom: spacing.md,
  },
  bottomSpacer: {
    height: spacing.xxl,
  },
});

