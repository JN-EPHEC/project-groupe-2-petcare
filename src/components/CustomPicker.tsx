import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../theme';

interface PickerOption {
  label: string;
  value: string;
}

interface CustomPickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: PickerOption[] | string[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  icon?: string;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Sélectionner',
  disabled = false,
  searchable = false,
  icon,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Normaliser les options avec vérification
  const normalizedOptions: PickerOption[] = (options || []).map(opt => 
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  // Filtrer les options selon la recherche
  const filteredOptions = searchable && searchQuery
    ? normalizedOptions.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : normalizedOptions;

  // Obtenir le label sélectionné
  const selectedLabel = normalizedOptions.find(opt => opt.value === value)?.label || placeholder;

  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.pickerButton,
          disabled && styles.pickerButtonDisabled,
          value && styles.pickerButtonSelected,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.pickerContent}>
          {icon && (
            <Ionicons
              name={icon as any}
              size={20}
              color={value ? colors.teal : colors.gray}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.pickerText,
              !value && styles.placeholderText,
              disabled && styles.disabledText,
            ]}
            numberOfLines={1}
          >
            {selectedLabel}
          </Text>
        </View>
        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? colors.lightGray : colors.teal}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{placeholder}</Text>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close" size={28} color={colors.navy} />
              </TouchableOpacity>
            </View>

            {/* Search bar */}
            {searchable && (
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colors.gray} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Rechercher..."
                  placeholderTextColor={colors.gray}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Options list */}
            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {filteredOptions.map((option, index) => (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  style={[
                    styles.optionItem,
                    value === option.value && styles.optionItemSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === option.value && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
                  )}
                </TouchableOpacity>
              ))}

              {filteredOptions.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="search-outline" size={48} color={colors.lightGray} />
                  <Text style={styles.emptyText}>Aucun résultat</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.lightBlue,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 52,
  },
  pickerButtonDisabled: {
    backgroundColor: colors.lightGray,
    opacity: 0.6,
  },
  pickerButtonSelected: {
    borderColor: colors.teal,
    backgroundColor: colors.white,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: spacing.sm,
  },
  pickerText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    fontWeight: typography.fontWeight.semiBold,
    flex: 1,
  },
  placeholderText: {
    color: colors.gray,
    fontWeight: typography.fontWeight.medium,
  },
  disabledText: {
    color: colors.lightGray,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.navy,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.navy,
    paddingVertical: spacing.xs,
  },
  optionsList: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    backgroundColor: colors.teal + '20',
    borderColor: colors.teal,
  },
  optionText: {
    fontSize: typography.fontSize.md,
    color: colors.navy,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: typography.fontWeight.bold,
    color: colors.teal,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.gray,
    marginTop: spacing.md,
  },
});

